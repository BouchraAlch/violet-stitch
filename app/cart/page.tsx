'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f3e8ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239333ea" font-size="12">No Image</text></svg>'

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
  } = useCart()

  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [address, setAddress] = useState('')

  const computedTotal =
    Number(totalPrice) ||
    cart.reduce((sum, item) => {
      const price = Number(item.product?.price) || 0
      const qty = Number(item.quantity) || 0

      return sum + price * qty
    }, 0)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim()) {
      alert('Please enter your Full Name.')
      return
    }

    if (!phoneNumber.trim()) {
      alert('Please enter your Phone Number.')
      return
    }

    if (!wilaya.trim()) {
      alert('Please enter your Wilaya / City.')
      return
    }

    if (!address.trim()) {
      alert('Please enter your Delivery Address.')
      return
    }

    if (cart.length === 0) return

    setLoading(true)

    const supabase = createClient()

    try {
      /*
       * ==========================================
       * 1. CREATE MAIN ORDER
       * ==========================================
       */

      const orderId = crypto.randomUUID()

      const orderPayload = {
        id: orderId,
        client_name: customerName.trim(),
        phone: phoneNumber.trim(),
        address: address.trim(),
        city: wilaya.trim(),
        total_price: computedTotal,
        status: 'pending',
      }

      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)

      if (orderError) {
        throw new Error(
          orderError.message ||
            'Failed to record main order'
        )
      }

      /*
       * ==========================================
       * 2. CREATE ORDER ITEMS
       * ==========================================
       *
       * Normal product:
       *
       * order_items
       *   product_id = actual product
       *   is_personalized_bouquet = false
       *
       * Personalized bouquet:
       *
       * order_items
       *   product_id = null
       *   is_personalized_bouquet = true
       *   unit_price = complete bouquet price
       *
       * Its components will be inserted into
       * personalized_bouquet_components below.
       */

      const normalItems = cart.filter(
        (item) => !item.isPersonalizedBouquet
      )

      const personalizedItems = cart.filter(
        (item) => item.isPersonalizedBouquet
      )

      /*
       * ==========================================
       * 3. INSERT NORMAL PRODUCTS
       * ==========================================
       */

      if (normalItems.length > 0) {
        const normalOrderItems = normalItems.map(
          (item) => ({
            order_id: orderId,
            product_id: item.product.id,
            quantity: Number(item.quantity) || 1,
            unit_price:
              Number(item.product.price) || 0,
            is_personalized_bouquet: false,
          })
        )

        const { error: normalItemsError } =
          await supabase
            .from('order_items')
            .insert(normalOrderItems)

        if (normalItemsError) {
          throw new Error(
            normalItemsError.message ||
              'Failed to record order items'
          )
        }
      }

      /*
       * ==========================================
       * 4. INSERT PERSONALIZED BOUQUETS
       * ==========================================
       */

      for (const bouquet of personalizedItems) {
        /*
         * Create ONE order_items row for the
         * entire personalized bouquet.
         */

        const bouquetOrderItemId = crypto.randomUUID()

        const { error: bouquetItemError } =
          await supabase
            .from('order_items')
            .insert({
              id: bouquetOrderItemId,
              order_id: orderId,

              /*
               * Personalized bouquets don't correspond
               * to a real products row.
               */
              product_id: null,

              quantity:
                Number(bouquet.quantity) || 1,

              unit_price:
                Number(bouquet.product.price) || 0,

              is_personalized_bouquet: true,
            })

        if (bouquetItemError) {
          throw new Error(
            bouquetItemError.message ||
              'Failed to record personalized bouquet'
          )
        }

        /*
         * ==========================================
         * 5. INSERT BOUQUET COMPONENTS
         * ==========================================
         */

        if (
          bouquet.bouquetComponents &&
          bouquet.bouquetComponents.length > 0
        ) {
          const componentRows =
            bouquet.bouquetComponents.map(
              (component) => ({
                order_item_id:
                  bouquetOrderItemId,

                product_id:
                  component.product.id,

                /*
                 * If the customer ordered 2 complete
                 * bouquets, every component quantity
                 * must also be multiplied by 2.
                 */
                quantity:
                  (Number(component.quantity) || 1) *
                  (Number(bouquet.quantity) || 1),

                unit_price:
                  Number(component.product.price) || 0,

                selected_color:
                  component.selectedColor ||
                  null,
              })
            )

          const {
            error: componentError,
          } = await supabase
            .from(
              'personalized_bouquet_components'
            )
            .insert(componentRows)

          if (componentError) {
            throw new Error(
              componentError.message ||
                'Failed to record bouquet components'
            )
          }
        }
      }

      /*
       * ==========================================
       * 6. SUCCESS
       * ==========================================
       */

      clearCart()
      setOrderSuccess(true)
    } catch (err: any) {
      console.error('Checkout error:', err)

      alert(
        `Error placing order: ${
          err.message || 'Please try again.'
        }`
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * ==========================================
   * ORDER SUCCESS
   * ==========================================
   */

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ✓
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h2>

        <p className="text-gray-600 text-sm mb-6">
          Thank you for your order. We will contact you via
          phone to confirm your delivery details.
        </p>

        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  /*
   * ==========================================
   * EMPTY CART
   * ==========================================
   */

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          Looks like you haven't added any items yet.
        </p>

        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Explore Collection
        </Link>
      </div>
    )
  }

  /*
   * ==========================================
   * CART
   * ==========================================
   */

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ========================================
          CART ITEMS
          ======================================== */}

      <div className="lg:col-span-7 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Your Shopping Cart
        </h1>

        {cart.map((item) => {
          const {
            product,
            quantity,
            selectedColor,
            isPersonalizedBouquet,
            bouquetComponents,
          } = item

          const imgUrl =
            product?.image_urls?.[0] ||
            bouquetComponents?.[0]?.product
              ?.image_urls?.[0] ||
            DEFAULT_PLACEHOLDER

          /*
           * ======================================
           * PERSONALIZED BOUQUET
           * ======================================
           */

          if (
            isPersonalizedBouquet &&
            bouquetComponents &&
            bouquetComponents.length > 0
          ) {
            return (
              <div
                key={product.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
              >
                {/* Bouquet header */}
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-purple-50 flex-shrink-0">
                    <Image
                      src={imgUrl}
                      alt="Personalized Bouquet"
                      fill
                      className="object-cover"
                      unoptimized={imgUrl.startsWith(
                        'data:'
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            Personalized Bouquet
                          </h3>

                          <span className="text-[10px] font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            Custom
                          </span>
                        </div>

                        <p className="text-purple-600 font-bold text-sm mt-1">
                          {Number(product.price) || 0}{' '}
                          DA
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(product.id)
                        }
                        className="text-gray-400 hover:text-red-500 p-2 transition flex-shrink-0"
                        aria-label="Remove personalized bouquet"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                {/* Components */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                    Bouquet Components
                  </p>

                  <div className="space-y-2">
                    {bouquetComponents.map(
                      (component, index) => {
                        const componentImage =
                          component.product
                            ?.image_urls?.[0] ||
                          DEFAULT_PLACEHOLDER

                        return (
                          <div
                            key={`${component.product.id}-${component.selectedColor || 'default'}-${index}`}
                            className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
                              <Image
                                src={componentImage}
                                alt={
                                  component.product
                                    ?.name ||
                                  'Bouquet component'
                                }
                                fill
                                className="object-cover"
                                unoptimized={componentImage.startsWith(
                                  'data:'
                                )}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {
                                  component.product
                                    ?.name
                                }
                              </p>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="text-xs text-gray-500">
                                  Qty:{' '}
                                  {
                                    component.quantity
                                  }
                                </span>

                                {component.selectedColor && (
                                  <span className="text-xs text-gray-500">
                                    Color:{' '}
                                    <span className="font-semibold text-purple-600 capitalize">
                                      {
                                        component.selectedColor
                                      }
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-semibold text-gray-700">
                                {Number(
                                  component.product
                                    ?.price
                                ) || 0}{' '}
                                DA
                              </p>

                              <p className="text-[10px] text-gray-400">
                                each
                              </p>
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                </div>

                {/* Bouquet quantity */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Number of bouquets
                  </span>

                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          product.id,
                          quantity - 1
                        )
                      }
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition"
                    >
                      -
                    </button>

                    <span className="px-4 py-1.5 font-semibold text-sm text-gray-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          product.id,
                          quantity + 1
                        )
                      }
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          /*
           * ======================================
           * NORMAL PRODUCT
           * ======================================
           */

          return (
            <div
              key={`${product.id}-${selectedColor || 'default'}`}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              {/* Image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-purple-50 flex-shrink-0">
                <Image
                  src={imgUrl}
                  alt={
                    product?.name || 'Product image'
                  }
                  fill
                  className="object-cover"
                  unoptimized={imgUrl.startsWith(
                    'data:'
                  )}
                />
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>

                {selectedColor && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-gray-500">
                      Color:
                    </span>

                    <span className="text-xs font-semibold text-purple-600 capitalize">
                      {selectedColor}
                    </span>
                  </div>
                )}

                <p className="text-purple-600 font-bold text-sm mt-1">
                  {product.price} DA
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(
                      product.id,
                      quantity - 1,
                      selectedColor
                    )
                  }
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition"
                >
                  -
                </button>

                <span className="px-3 py-1 font-semibold text-sm text-gray-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(
                      product.id,
                      quantity + 1,
                      selectedColor
                    )
                  }
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition"
                >
                  +
                </button>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() =>
                  removeFromCart(
                    product.id,
                    selectedColor
                  )
                }
                className="text-gray-400 hover:text-red-500 p-2 transition flex-shrink-0"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* ========================================
          CHECKOUT
          ======================================== */}

      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Order Details (Cash on Delivery)
        </h2>

        <form
          onSubmit={handleCheckout}
          className="space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name
            </label>

            <input
              type="text"
              required
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              placeholder="e.g. Amina Benali"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number
            </label>

            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value)
              }
              placeholder="06XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Wilaya */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Wilaya / City
            </label>

            <input
              type="text"
              required
              value={wilaya}
              onChange={(e) =>
                setWilaya(e.target.value)
              }
              placeholder="e.g. Constantine"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Delivery Address
            </label>

            <input
              type="text"
              required
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              placeholder="Street name, house/apartment number"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Total */}
          <div className="border-t border-gray-100 pt-4 my-4 flex justify-between items-center font-bold text-lg">
            <span>Total:</span>

            <span className="text-purple-600">
              {computedTotal} DA
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {loading
              ? 'Processing Order...'
              : 'Confirm Order (Pay on Delivery)'}
          </button>
        </form>
      </div>
    </div>
  )
}