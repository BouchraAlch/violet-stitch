import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
        {/* Col 1 */}
        <div>
          <h3 className="text-2xl font-bold text-purple-300 mb-4">Violet Stitch</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Handmade crochet designs crafted with passion. Creating unique flowers, keychains, and clothes.
          </p>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-semibold text-white mb-4">Categories</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/category/flowers" className="hover:text-purple-300 transition">Flowers</Link></li>
            <li><Link href="/category/keychains" className="hover:text-purple-300 transition">Keychains</Link></li>
            <li><Link href="/category/clothes" className="hover:text-purple-300 transition">Clothes</Link></li>
            <li><Link href="/category/others" className="hover:text-purple-300 transition">Others</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-purple-300 transition">Home</Link></li>
            <li><Link href="#about" className="hover:text-purple-300 transition">About Us</Link></li>
            <li><Link href="/cart" className="hover:text-purple-300 transition">Your Cart</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="font-semibold text-white mb-4">Contact & Orders</h4>
          <p className="text-sm text-gray-400 mb-2">Delivery available across 69 Wilayas.</p>
          <p className="text-sm text-gray-400">Cash on Delivery (COD)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Violet Stitch. All rights reserved.
      </div>
    </footer>
  )
}