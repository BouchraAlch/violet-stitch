'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types/database'
import { useCart } from '@/context/CartContext'

interface ProductQuickAddModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

/* -------------------------------------------------------------------------- */
/* Colors                                                                     */
/* -------------------------------------------------------------------------- */

const colorNames: Record<string, string> = {
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#FF0000': 'Red',
  '#00FF00': 'Green',
  '#0000FF': 'Blue',
  '#FFFF00': 'Yellow',
  '#FFA500': 'Orange',
  '#800080': 'Purple',
  '#FFC0CB': 'Pink',
  '#A52A2A': 'Brown',
  '#808080': 'Gray',
  '#C0C0C0': 'Silver',
  '#FFD700': 'Gold',
  '#008000': 'Green',
  '#00FFFF': 'Cyan',
  '#F5F5DC': 'Beige',
  '#800000': 'Maroon',
  '#000080': 'Navy Blue',
  '#008080': 'Teal',
  '#4B0082': 'Indigo',
  '#EE82EE': 'Violet',
  '#F5DEB3': 'Wheat',
  '#D2691E': 'Chocolate',
  '#F0E68C': 'Khaki',
  '#E6E6FA': 'Lavender',
  '#FF7F50': 'Coral',
  '#DC143C': 'Crimson',
  '#40E0D0': 'Turquoise',
  '#98FB98': 'Pale Green',
  '#ADD8E6': 'Light Blue',
  '#90EE90': 'Light Green',
  '#FFFFE0': 'Light Yellow',
  '#FFB6C1': 'Light Pink',
  '#D3D3D3': 'Light Gray',
  '#A9A9A9': 'Dark Gray',
  '#DARKBLUE': 'Dark Blue',
}

const getColorName = (color: string): string => {
  const normalized = color.trim().toUpperCase()

  if (colorNames[normalized]) {
    return colorNames[normalized]
  }

  /*
   * If the color is a valid hexadecimal value but isn't
   * in the list above, calculate an approximate readable name.
   */
  if (/^#[0-9A-F]{6}$/i.test(normalized)) {
    const r = parseInt(normalized.slice(1, 3), 16)
    const g = parseInt(normalized.slice(3, 5), 16)
    const b = parseInt(normalized.slice(5, 7), 16)

    if (r < 40 && g < 40 && b < 40) {
      return 'Black'
    }

    if (r > 220 && g > 220 && b > 220) {
      return 'White'
    }

    if (
      r > 180 &&
      g > 180 &&
      b < 100
    ) {
      return 'Yellow'
    }

    if (
      r > 180 &&
      g < 100 &&
      b < 100
    ) {
      return 'Red'
    }

    if (
      r < 100 &&
      g > 150 &&
      b < 100
    ) {
      return 'Green'
    }

    if (
      r < 100 &&
      g < 150 &&
      b > 150
    ) {
      return 'Blue'
    }

    if (
      r > 180 &&
      g < 130 &&
      b > 150
    ) {
      return 'Pink'
    }

    if (
      r > 180 &&
      g > 100 &&
      b < 80
    ) {
      return 'Orange'
    }

    if (
      r > 100 &&
      g < 100 &&
      b > 100
    ) {
      return 'Purple'
    }

    if (
      Math.abs(r - g) < 20 &&
      Math.abs(g - b) < 20
    ) {
      return 'Gray'
    }

    if (
      b > r &&
      b > g
    ) {
      return 'Blue'
    }

    if (
      r > g &&
      r > b
    ) {
      return 'Red'
    }

    if (
      g > r &&
      g > b
    ) {
      return 'Green'
    }
  }

  return color
}

const parseColors = (product: Product): string[] => {
  const rawColor =
    (product as any)?.colors ||
    (product as any)?.color ||
    ''

  if (Array.isArray(rawColor)) {
    return rawColor
      .map((color) => String(color).trim())
      .filter(Boolean)
  }

  const cleanString = String(rawColor)
    .replace(/colors?:/gi, '')
    .replace(/[\[\]'"]/g, '')

  return cleanString
    .split(',')
    .map((color) => color.trim())
    .filter(Boolean)
}

const parseImages = (product: Product): string[] => {
  const rawUrls =
    (product as any)?.image_urls ||
    (product as any)?.img_link

  if (!rawUrls) {
    return ['/flower.png']
  }

  if (Array.isArray(rawUrls)) {
    const images = rawUrls
      .map((image) => String(image).trim())
      .filter(Boolean)

    return images.length > 0
      ? images
      : ['/flower.png']
  }

  if (typeof rawUrls === 'string') {
    try {
      const parsed = JSON.parse(rawUrls)

      if (
        Array.isArray(parsed) &&
        parsed.length > 0
      ) {
        const images = parsed
          .map((image) => String(image).trim())
          .filter(Boolean)

        if (images.length > 0) {
          return images
        }
      }
    } catch {
      // Not JSON
    }

    if (rawUrls.trim()) {
      return [rawUrls.trim()]
    }
  }

  return ['/flower.png']
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProductQuickAddModal({
  product,
  isOpen,
  onClose,
}: ProductQuickAddModalProps) {
  const { addToCart } = useCart()

  const [selectedColor, setSelectedColor] =
    useState('')

  const [quantity, setQuantity] = useState(1)

  const [added, setAdded] = useState(false)

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0)

  const availableColors = product
    ? parseColors(product)
    : []

  const productImages = product
    ? parseImages(product)
    : ['/flower.png']

  const productName =
    product?.name || 'Handcrafted Item'

  const productPrice =
    Number(product?.price) || 0

  useEffect(() => {
    if (isOpen && product) {
      setSelectedColor(
        availableColors.length > 0
          ? availableColors[0]
          : ''
      )

      setQuantity(1)
      setAdded(false)
      setSelectedImageIndex(0)
    }
  }, [isOpen, product?.id])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener(
      'keydown',
      handleEscape
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow =
        previousOverflow
    }
  }, [isOpen])

  if (!isOpen || !product) {
    return null
  }

  const handleAddToCart = () => {
    addToCart(
      product,
      quantity,
      selectedColor
    )

    setAdded(true)

    setTimeout(() => {
      setAdded(false)
      onClose()
    }, 700)
  }

  const selectedImage =
    productImages[selectedImageIndex] ||
    productImages[0] ||
    '/flower.png'

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        px-3 py-4 sm:p-4
        bg-black/45
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
      aria-label={`Add ${productName} to cart`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="
          relative z-10
          w-full
          max-w-[340px]
          sm:max-w-md
          max-h-[88vh]
          overflow-y-auto
          bg-white
          rounded-2xl
          sm:rounded-3xl
          shadow-2xl
          border border-gray-100
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
        onMouseDown={(event) => {
          event.stopPropagation()
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            top-2.5 right-2.5
            sm:top-3.5 sm:right-3.5
            z-20
            w-8 h-8
            rounded-full
            bg-white/90
            border border-gray-200
            shadow-sm
            flex items-center justify-center
            text-gray-600
            hover:text-gray-900
            hover:bg-white
            transition
          "
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Main image */}
        <div
          className="
            relative
            w-full
            aspect-square
            bg-purple-50
            overflow-hidden
            rounded-t-2xl
            sm:rounded-t-3xl
          "
        >
          <Image
            src={selectedImage}
            alt={`${productName} photo ${selectedImageIndex + 1}`}
            fill
            unoptimized
            sizes="
              (max-width: 640px) 340px,
              448px
            "
            className="object-cover object-center"
          />

          {productImages.length > 1 && (
            <div
              className="
                absolute
                bottom-2.5
                right-2.5
                bg-black/55
                text-white
                text-[10px]
                font-semibold
                px-2
                py-1
                rounded-full
                backdrop-blur-sm
              "
            >
              {selectedImageIndex + 1} /{' '}
              {productImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {productImages.length > 1 && (
          <div className="px-4 sm:px-5 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {productImages.map(
                (image, index) => {
                  const isSelected =
                    selectedImageIndex === index

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(index)
                      }
                      className={`
                        relative
                        flex-shrink-0
                        w-12 h-12
                        sm:w-14 sm:h-14
                        rounded-lg
                        overflow-hidden
                        bg-purple-50
                        transition-all
                        ${
                          isSelected
                            ? 'ring-2 ring-purple-600 ring-offset-1'
                            : 'border border-gray-200 opacity-70 hover:opacity-100'
                        }
                      `}
                      aria-label={`View photo ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${productName} thumbnail ${index + 1}`}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-cover object-center"
                      />
                    </button>
                  )
                }
              )}
            </div>
          </div>
        )}

        {/* Product information */}
        <div className="p-4 sm:p-5">
          {/* Name + price */}
          <div className="mb-4 pr-8">
            <h2
              className="
                text-lg
                sm:text-xl
                font-extrabold
                text-gray-900
                line-clamp-2
              "
            >
              {productName}
            </h2>

            <p className="text-base sm:text-lg font-extrabold text-purple-700 mt-0.5">
              {productPrice} DA
            </p>
          </div>

          {/* Colors */}
          {availableColors.length > 0 && (
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-sm font-semibold text-gray-900">
                  Color
                </span>

                {selectedColor && (
                  <span className="text-xs sm:text-sm font-semibold text-purple-600">
                    • {getColorName(selectedColor)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {availableColors.map(
                  (color, index) => {
                    const isSelected =
                      selectedColor === color

                    const looksLikeHex =
                      /^#[0-9A-F]{3,8}$/i.test(
                        color
                      )

                    return (
                      <button
                        key={`${color}-${index}`}
                        type="button"
                        title={getColorName(color)}
                        aria-label={`Select ${getColorName(color)}`}
                        onClick={() =>
                          setSelectedColor(color)
                        }
                        className={`
                          relative
                          w-8 h-8
                          sm:w-9 sm:h-9
                          rounded-full
                          flex items-center justify-center
                          transition-all duration-200
                          ${
                            isSelected
                              ? 'ring-2 ring-purple-600 ring-offset-2 scale-110'
                              : 'border border-gray-300 hover:scale-105'
                          }
                        `}
                        style={{
                          backgroundColor:
                            looksLikeHex
                              ? color
                              : undefined,
                        }}
                      >
                        {!looksLikeHex && (
                          <span
                            className="
                              text-[8px]
                              sm:text-[9px]
                              font-semibold
                              capitalize
                              text-gray-700
                            "
                          >
                            {getColorName(color).slice(
                              0,
                              2
                            )}
                          </span>
                        )}

                        {isSelected && (
                          <span className="absolute inset-0 rounded-full ring-1 ring-white/60" />
                        )}
                      </button>
                    )
                  }
                )}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-sm font-semibold text-gray-900 mb-2.5">
              Quantity
            </label>

            <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                  )
                }
                className="
                  w-8 h-8
                  sm:w-9 sm:h-9
                  rounded-lg
                  bg-white
                  text-gray-700
                  shadow-sm
                  flex items-center justify-center
                  hover:bg-gray-100
                  transition
                "
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <span className="w-10 sm:w-11 text-center font-bold text-gray-900 text-sm">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (current) =>
                      current + 1
                  )
                }
                className="
                  w-8 h-8
                  sm:w-9 sm:h-9
                  rounded-lg
                  bg-white
                  text-gray-700
                  shadow-sm
                  flex items-center justify-center
                  hover:bg-gray-100
                  transition
                "
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Total + Add to cart */}
          <div className="border-t border-gray-100 pt-3.5 sm:pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm text-gray-500">
                Total
              </span>

              <span className="text-base sm:text-lg font-extrabold text-gray-900">
                {productPrice * quantity} DA
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={added}
              className={`
                w-full
                py-2.5
                sm:py-3
                rounded-xl
                sm:rounded-2xl
                font-bold
                text-sm
                flex items-center justify-center gap-2
                shadow-md
                transition-all
                ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.99]'
                }
              `}
            >
              {added ? (
                <>
                  <span className="text-base">
                    ✓
                  </span>
                  Added to Order
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}