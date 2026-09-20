'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'

// Fallback SVG data URI for missing product images
const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f3e8ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239333ea" font-size="12">No Image</text></svg>'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  // Form State
  const [customerName, setCustomerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [address, setAddress] = useState('')

  // Compute and sanitize order total
  const computedTotal = Number(totalPrice) || cart.reduce((sum, item) => {
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
      const orderId = crypto.randomUUID()

      // Payload matching exact database schema columns
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
        throw new Error(orderError.message || 'Failed to record main order')
      }

      // Order items insert
      const orderItems = cart.map((item) => {
        const unitPrice = Number(item.product?.price) || 0
        const qty = Number(item.quantity) || 1
        return {
          order_id: orderId,
          product_id: item.product.id,
          quantity: qty,
          unit_price: unitPrice,
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        throw new Error(itemsError.message || 'Failed to record order items')
      }

      clearCart()
      setOrderSuccess(true)
    } catch (err: any) {
      console.error('Checkout error:', err)
      alert(`Error placing order: ${err.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 text-sm mb-6">
          Thank you for your order. We will contact you via phone to confirm your delivery details.
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

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Looks like you haven't added any items yet.</p>
        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Explore Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* CART ITEMS LIST */}
      <div className="lg:col-span-7 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Shopping Cart</h1>
        {cart.map(({ product, quantity }) => {
          const imgUrl = product.image_urls?.[0] || DEFAULT_PLACEHOLDER

          return (
            <div
              key={product.id}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-purple-50 flex-shrink-0">
                <Image
                  src={imgUrl}
                  alt={product?.name || 'Product image'}
                  fill
                  className="object-cover"
                  unoptimized={imgUrl.startsWith('data:')}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-purple-600 font-bold text-sm mt-1">{product.price} DA</p>
              </div>

              {/* QUANTITY CONTROLS */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition"
                >
                  -
                </button>
                <span className="px-3 py-1 font-semibold text-sm text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition"
                >
                  +
                </button>
              </div>

              {/* REMOVE ITEM */}
              <button
                type="button"
                onClick={() => removeFromCart(product.id)}
                className="text-gray-400 hover:text-red-500 p-2 transition"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* CHECKOUT FORM */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details (Cash on Delivery)</h2>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Amina Benali"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="06XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Wilaya / City</label>
            <input
              type="text"
              required
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              placeholder="e.g. Constantine"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street name, house/apartment number"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          <div className="border-t border-gray-100 pt-4 my-4 flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span className="text-purple-600">{computedTotal} DA</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Processing Order...' : 'Confirm Order (Pay on Delivery)'}
          </button>
        </form>
      </div>
    </div>
  )
}