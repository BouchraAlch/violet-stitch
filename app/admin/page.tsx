"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

interface Order {
  id: string;
  client_name: string;
  phone: string;
  address: string;
  city: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  is_personalized_bouquet: boolean;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image_urls: string[] | null;
  colors: string[] | null;
}

interface BouquetComponent {
  id: string;
  order_item_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  selected_color: string | null;
}

interface OrderItemWithProduct extends OrderItem {
  product: Product | null;
  components: Array<
    BouquetComponent & {
      product: Product | null;
    }
  >;
}

interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

const supabase = createClient();

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function getStatusBadgeClasses(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-white border border-gray-300 text-gray-700";

    case "confirmed":
      return "bg-yellow-100 border border-yellow-200 text-yellow-800";

    case "shipped":
      return "bg-orange-100 border border-orange-200 text-orange-800";

    case "delivered":
      return "bg-green-100 border border-green-200 text-green-800";

    case "cancelled":
      return "bg-red-100 border border-red-200 text-red-800";

    default:
      return "bg-white border border-gray-300 text-gray-700";
  }
}

function getStatusSectionClasses(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "border-gray-200";

    case "confirmed":
      return "border-yellow-200";

    case "shipped":
      return "border-orange-200";

    case "delivered":
      return "border-green-200";

    case "cancelled":
      return "border-red-200";

    default:
      return "border-gray-200";
  }
}

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------------------------
      // Check authentication
      // ------------------------------------------------------------
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        window.location.href = "/admin/login";
        return;
      }

      // ------------------------------------------------------------
      // 1. Get orders
      // ------------------------------------------------------------
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      const orderIds = ordersData.map((order) => order.id);

      // ------------------------------------------------------------
      // 2. Get order items
      // ------------------------------------------------------------
      const { data: orderItemsData, error: orderItemsError } =
        await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

      if (orderItemsError) {
        throw orderItemsError;
      }

      const orderItems = (orderItemsData || []) as OrderItem[];

      // ------------------------------------------------------------
      // 3. Get bouquet components
      // ------------------------------------------------------------
      const bouquetOrderItemIds = orderItems
        .filter((item) => item.is_personalized_bouquet)
        .map((item) => item.id);

      let bouquetComponents: BouquetComponent[] = [];

      if (bouquetOrderItemIds.length > 0) {
        const { data, error: componentsError } = await supabase
          .from("personalized_bouquet_components")
          .select("*")
          .in("order_item_id", bouquetOrderItemIds);

        if (componentsError) {
          throw componentsError;
        }

        bouquetComponents = (data || []) as BouquetComponent[];
      }

      // ------------------------------------------------------------
      // 4. Collect product IDs
      // ------------------------------------------------------------
      const productIds = new Set<string>();

      orderItems.forEach((item) => {
        if (item.product_id) {
          productIds.add(item.product_id);
        }
      });

      bouquetComponents.forEach((component) => {
        productIds.add(component.product_id);
      });

      // ------------------------------------------------------------
      // 5. Get products
      // ------------------------------------------------------------
      let products: Product[] = [];

      if (productIds.size > 0) {
        const { data: productsData, error: productsError } =
          await supabase
            .from("products")
            .select("id, title, price, image_urls, colors")
            .in("id", Array.from(productIds));

        if (productsError) {
          throw productsError;
        }

        products = (productsData || []) as Product[];
      }

      const productMap = new Map<string, Product>();

      products.forEach((product) => {
        productMap.set(product.id, product);
      });

      // ------------------------------------------------------------
      // 6. Build orders
      // ------------------------------------------------------------
      const finalOrders: OrderWithItems[] = ordersData.map((order) => {
        const itemsForOrder = orderItems
          .filter((item) => item.order_id === order.id)
          .map((item) => {
            const components = bouquetComponents
              .filter(
                (component) => component.order_item_id === item.id
              )
              .map((component) => ({
                ...component,
                product: productMap.get(component.product_id) || null,
              }));

            return {
              ...item,
              product: item.product_id
                ? productMap.get(item.product_id) || null
                : null,
              components,
            };
          });

        return {
          ...order,
          items: itemsForOrder,
        };
      });

      setOrders(finalOrders);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // Update status
  // ------------------------------------------------------------
  async function updateStatus(
    orderId: string,
    status: OrderStatus
  ) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) {
        throw error;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    } catch (err: any) {
      alert(err.message || "Unable to update order status.");
    }
  }

  function toggleOrder(orderId: string) {
    setExpandedOrders((current) => {
      const next = new Set(current);

      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }

      return next;
    });
  }

  function formatPrice(price: number) {
    return `${Number(price || 0).toLocaleString()} DA`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-DZ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getProductImage(product: Product | null) {
    if (!product?.image_urls || product.image_urls.length === 0) {
      return null;
    }

    return product.image_urls[0];
  }

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="mb-3 h-8 w-48 rounded bg-gray-200" />
            <div className="h-4 w-72 rounded bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Error
  // ------------------------------------------------------------
  if (error) {
    return (
      <main className="min-h-screen bg-[#faf8f5] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Unable to load orders
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={loadOrders}
              className="mt-4 rounded-lg bg-[#6d4aff] px-4 py-2 text-sm font-medium text-white hover:bg-[#5c3ee0]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------
  // Empty
  // ------------------------------------------------------------
  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf8f5] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold text-[#241d2f]">
            Orders
          </h1>

          <p className="mt-2 text-gray-500">
            No orders yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8a6bbd]">
              Violet Stitch
            </p>

            <h1 className="mt-1 text-3xl font-semibold text-[#241d2f]">
              Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {orders.length} total order
              {orders.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* Orders grouped by status */}
        <div className="space-y-10">
          {STATUS_ORDER.map((status) => {
            const statusOrders = orders.filter(
              (order) => order.status === status
            );

            if (statusOrders.length === 0) {
              return null;
            }

            return (
              <section key={status}>
                {/* Section title */}
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-[#241d2f]">
                    {STATUS_LABELS[status]}
                  </h2>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                      status
                    )}`}
                  >
                    {statusOrders.length}
                  </span>
                </div>

                <div className="space-y-5">
                  {statusOrders.map((order) => {
                    const isExpanded = expandedOrders.has(order.id);

                    return (
                      <div
                        key={order.id}
                        className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${getStatusSectionClasses(
                          status
                        )}`}
                      >
                        {/* Order header */}
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                            {/* Customer */}
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-semibold text-[#241d2f]">
                                  {order.client_name}
                                </h3>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                                    order.status
                                  )}`}
                                >
                                  {STATUS_LABELS[order.status]}
                                </span>
                              </div>

                              <div className="mt-3 space-y-1 text-sm text-gray-600">
                                <p>{order.phone}</p>

                                <p>
                                  {order.address}, {order.city}
                                </p>

                                <p className="text-xs text-gray-400">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                            </div>

                            {/* Total + status */}
                            <div className="flex flex-col items-start gap-3 sm:items-end">
                              <p className="text-xl font-semibold text-[#241d2f]">
                                {formatPrice(order.total_price)}
                              </p>

                              <select
                                value={order.status}
                                onChange={(e) =>
                                  updateStatus(
                                    order.id,
                                    e.target.value as OrderStatus
                                  )
                                }
                                className={`rounded-lg px-3 py-2 text-sm font-medium outline-none ${getStatusBadgeClasses(
                                  order.status
                                )}`}
                              >
                                <option value="pending">
                                  Pending
                                </option>

                                <option value="confirmed">
                                  Confirmed
                                </option>

                                <option value="shipped">
                                  Shipped
                                </option>

                                <option value="delivered">
                                  Delivered
                                </option>

                                <option value="cancelled">
                                  Cancelled
                                </option>
                              </select>
                            </div>
                          </div>

                          {/* Details button */}
                          <button
                            onClick={() => toggleOrder(order.id)}
                            className="mt-5 text-sm font-medium text-[#73559d] hover:text-[#5d4385]"
                          >
                            {isExpanded
                              ? "Hide order details ↑"
                              : "View order details ↓"}
                          </button>
                        </div>

                        {/* Order details */}
                        {isExpanded && (
                          <div className="border-t border-[#eee8f0] bg-[#fdfbfd] p-5 sm:p-6">
                            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                              Ordered items
                            </h4>

                            <div className="space-y-4">
                              {order.items.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                  No items found for this order.
                                </p>
                              ) : (
                                order.items.map((item) => {

                                  // ------------------------------------------------
                                  // Personalized bouquet
                                  // ------------------------------------------------
                                  if (
                                    item.is_personalized_bouquet
                                  ) {
                                    return (
                                      <div
                                        key={item.id}
                                        className="rounded-xl border border-[#dfd2ea] bg-white p-4"
                                      >
                                        <div className="flex items-center justify-between gap-4">
                                          <div>
                                            <h5 className="font-semibold text-[#241d2f]">
                                              Personalized Bouquet
                                            </h5>

                                            <p className="mt-1 text-sm text-gray-500">
                                              Quantity:{" "}
                                              {item.quantity}
                                            </p>
                                          </div>

                                          <p className="font-semibold text-[#241d2f]">
                                            {formatPrice(
                                              item.unit_price
                                            )}
                                          </p>
                                        </div>

                                        {/* Components */}
                                        <div className="mt-4 border-t border-gray-100 pt-4">
                                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                            Bouquet components
                                          </p>

                                          <div className="space-y-3">
                                            {item.components.length ===
                                            0 ? (
                                              <p className="text-sm text-gray-500">
                                                No bouquet components
                                                found.
                                              </p>
                                            ) : (
                                              item.components.map(
                                                (component) => {
                                                  const image =
                                                    getProductImage(
                                                      component.product
                                                    );

                                                  return (
                                                    <div
                                                      key={
                                                        component.id
                                                      }
                                                      className="flex items-center gap-3 rounded-lg bg-[#faf8f5] p-3"
                                                    >
                                                      {image ? (
                                                        <img
                                                          src={image}
                                                          alt={
                                                            component
                                                              .product
                                                              ?.title ||
                                                            "Bouquet component"
                                                          }
                                                          className="h-14 w-14 rounded-lg object-cover"
                                                        />
                                                      ) : (
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                                          No image
                                                        </div>
                                                      )}

                                                      <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-[#241d2f]">
                                                          {component
                                                            .product
                                                            ?.title ||
                                                            "Unknown product"}
                                                        </p>

                                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                          <span>
                                                            Qty:{" "}
                                                            {
                                                              component.quantity
                                                            }
                                                          </span>

                                                          <span>
                                                            Price:{" "}
                                                            {formatPrice(
                                                              component.unit_price
                                                            )}
                                                          </span>

                                                          {component.selected_color && (
                                                            <span className="flex items-center gap-1">
                                                              Color:

                                                              <span
                                                                className="inline-block h-3 w-3 rounded-full border border-gray-300"
                                                                style={{
                                                                  backgroundColor:
                                                                    component.selected_color,
                                                                }}
                                                              />

                                                              {
                                                                component.selected_color
                                                              }
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // ------------------------------------------------
                                  // Normal product
                                  // ------------------------------------------------
                                  const image = getProductImage(
                                    item.product
                                  );

                                  return (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4"
                                    >
                                      {image ? (
                                        <img
                                          src={image}
                                          alt={
                                            item.product?.title ||
                                            "Product"
                                          }
                                          className="h-16 w-16 rounded-lg object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                          No image
                                        </div>
                                      )}

                                      <div className="min-w-0 flex-1">
                                        <h5 className="font-medium text-[#241d2f]">
                                          {item.product?.title ||
                                            "Unknown product"}
                                        </h5>

                                        <div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-500">
                                          <span>
                                            Quantity:{" "}
                                            {item.quantity}
                                          </span>

                                          <span>
                                            Unit price:{" "}
                                            {formatPrice(
                                              item.unit_price
                                            )}
                                          </span>
                                        </div>
                                      </div>

                                      <p className="text-sm font-semibold text-[#241d2f]">
                                        {formatPrice(
                                          Number(item.unit_price) *
                                            Number(item.quantity)
                                        )}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}