'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

import { Product } from '@/lib/types/database'

export interface PersonalizedBouquetComponent {
  product: Product
  quantity: number
  selectedColor?: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedColor?: string

  // Personalized bouquet fields
  isPersonalizedBouquet?: boolean
  bouquetComponents?: PersonalizedBouquetComponent[]
}

interface CartContextType {
  cart: CartItem[]

  addToCart: (
    product: Product,
    quantity?: number,
    selectedColor?: string
  ) => void

  addPersonalizedBouquet: (
    components: PersonalizedBouquetComponent[]
  ) => void

  removeFromCart: (
    productId: string,
    selectedColor?: string
  ) => void

  updateQuantity: (
    productId: string,
    quantity: number,
    selectedColor?: string
  ) => void

  clearCart: () => void

  totalPrice: number
  totalItems: number
}

const CartContext = createContext<
  CartContextType | undefined
>(undefined)

export function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [cart, setCart] = useState<CartItem[]>([])

  /*
   * ==========================================
   * LOAD CART
   * ==========================================
   */

  useEffect(() => {
    const savedCart = localStorage.getItem(
      'violet_stitch_cart'
    )

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error(
          'Failed to parse saved cart:',
          error
        )
      }
    }
  }, [])

  /*
   * ==========================================
   * SAVE CART
   * ==========================================
   */

  useEffect(() => {
    localStorage.setItem(
      'violet_stitch_cart',
      JSON.stringify(cart)
    )
  }, [cart])

  /*
   * ==========================================
   * ADD NORMAL PRODUCT
   * ==========================================
   */

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedColor: string = ''
  ) => {
    if (quantity <= 0) return

    setCart((prevCart) => {
      const normalizedColor = selectedColor
        .trim()
        .toLowerCase()

      /*
       * Only compare normal products here.
       *
       * Personalized bouquets are always treated
       * as separate cart items.
       */

      const existing = prevCart.find(
        (item) =>
          !item.isPersonalizedBouquet &&
          item.product.id === product.id &&
          (item.selectedColor || '')
            .trim()
            .toLowerCase() === normalizedColor
      )

      if (existing) {
        return prevCart.map((item) => {
          if (
            !item.isPersonalizedBouquet &&
            item.product.id === product.id &&
            (item.selectedColor || '')
              .trim()
              .toLowerCase() === normalizedColor
          ) {
            return {
              ...item,
              quantity:
                item.quantity + quantity,
            }
          }

          return item
        })
      }

      return [
        ...prevCart,
        {
          product,
          quantity,
          selectedColor:
            selectedColor.trim() || undefined,
          isPersonalizedBouquet: false,
        },
      ]
    })
  }

  /*
   * ==========================================
   * ADD PERSONALIZED BOUQUET
   * ==========================================
   */

  const addPersonalizedBouquet = (
    components: PersonalizedBouquetComponent[]
  ) => {
    if (!components || components.length === 0) {
      return
    }

    /*
     * Calculate complete bouquet price.
     */

    const bouquetTotal = components.reduce(
      (sum, component) => {
        const price =
          Number(component.product?.price) || 0

        const quantity =
          Number(component.quantity) || 0

        return sum + price * quantity
      },
      0
    )

    /*
     * Use the first component image as the
     * representative bouquet image.
     */

    const firstImage =
      components[0]?.product?.image_urls?.[0] ||
      ''

    /*
     * Create a virtual Product object.
     *
     * IMPORTANT:
     * We do NOT use category: 'bouquet'
     * because your Product type does not allow it.
     *
     * Instead, we inherit the category from the
     * first selected product.
     */

    const bouquetProduct = {
      ...components[0].product,

      id: `personalized-bouquet-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,

      name: 'Personalized Bouquet',

      price: bouquetTotal,

      category:
        components[0].product.category,

      image_urls: firstImage
        ? [firstImage]
        : [],
    } as Product

    /*
     * Add the complete bouquet as ONE cart item.
     */

    setCart((prevCart) => [
      ...prevCart,

      {
        product: bouquetProduct,

        quantity: 1,

        isPersonalizedBouquet: true,

        bouquetComponents: components.map(
          (component) => ({
            product: component.product,
            quantity: component.quantity,
            selectedColor:
              component.selectedColor,
          })
        ),
      },
    ])
  }

  /*
   * ==========================================
   * REMOVE FROM CART
   * ==========================================
   */

  const removeFromCart = (
    productId: string,
    selectedColor?: string
  ) => {
    setCart((prevCart) => {
      const normalizedColor = (
        selectedColor || ''
      )
        .trim()
        .toLowerCase()

      return prevCart.filter((item) => {
        /*
         * Personalized bouquet:
         * identify it only by its virtual product ID.
         */

        if (item.isPersonalizedBouquet) {
          return item.product.id !== productId
        }

        /*
         * Normal product:
         * identify by product + color.
         */

        const sameProduct =
          item.product.id === productId

        if (!sameProduct) {
          return true
        }

        const itemColor = (
          item.selectedColor || ''
        )
          .trim()
          .toLowerCase()

        return itemColor !== normalizedColor
      })
    })
  }

  /*
   * ==========================================
   * UPDATE QUANTITY
   * ==========================================
   */

  const updateQuantity = (
    productId: string,
    quantity: number,
    selectedColor?: string
  ) => {
    /*
     * Quantity <= 0 removes the item.
     */

    if (quantity <= 0) {
      removeFromCart(productId, selectedColor)
      return
    }

    setCart((prevCart) => {
      const normalizedColor = (
        selectedColor || ''
      )
        .trim()
        .toLowerCase()

      return prevCart.map((item) => {
        /*
         * Personalized bouquet
         */

        if (item.isPersonalizedBouquet) {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity,
            }
          }

          return item
        }

        /*
         * Normal product
         */

        const sameProduct =
          item.product.id === productId

        const itemColor = (
          item.selectedColor || ''
        )
          .trim()
          .toLowerCase()

        if (
          sameProduct &&
          itemColor === normalizedColor
        ) {
          return {
            ...item,
            quantity,
          }
        }

        return item
      })
    })
  }

  /*
   * ==========================================
   * CLEAR CART
   * ==========================================
   */

  const clearCart = () => {
    setCart([])
  }

  /*
   * ==========================================
   * TOTAL PRICE
   * ==========================================
   */

  const totalPrice = cart.reduce(
    (sum, item) => {
      const price =
        Number(item.product?.price) || 0

      const quantity =
        Number(item.quantity) || 0

      return sum + price * quantity
    },
    0
  )

  /*
   * ==========================================
   * TOTAL ITEMS
   * ==========================================
   *
   * A personalized bouquet counts as ONE item
   * regardless of how many components it contains.
   */

  const totalItems = cart.reduce(
    (sum, item) => {
      return (
        sum + (Number(item.quantity) || 0)
      )
    },
    0
  )

  /*
   * ==========================================
   * PROVIDER
   * ==========================================
   */

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addPersonalizedBouquet,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/*
 * ==========================================
 * USE CART
 * ==========================================
 */

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider'
    )
  }

  return context
}