export type Category = 'flowers' | 'keychains' | 'clothes' | 'others'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_urls?: string[]
  colors?: string[]
  category?: 'flowers' | 'keychains' | 'clothes' | 'others'
  is_bestseller?: boolean
  created_at?: string
}

export type Order = {
  id: string
  client_name: string
  phone: string
  address: string
  city: string
  total_price: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'canceled'
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}

export type CartItem = {
  product: Product
  quantity: number
  selectedImageIndex?: number
}