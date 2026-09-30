"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/context/CartContext"

export default function Navbar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const { totalItems } = useCart()

  // Controls whether the Products dropdown is visible on desktop.
  const [isProductsOpen, setIsProductsOpen] = useState(false)

  // Controls whether the mobile navigation drawer is open or closed.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Controls whether the Products submenu is expanded inside the mobile drawer.
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false)

  // Toggles the mobile navigation drawer between open and closed states.
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  // Closes the mobile drawer and resets its Products submenu.
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setIsMobileProductsOpen(false)
  }










  return (
    <header
      className={`top-0 left-0 right-0 z-50 text-white transition-colors duration-300 ${
        isHomePage
          ? "absolute bg-transparent border-b border-white/10"
          : "sticky bg-purple-900 border-b border-purple-800/50 shadow-md"
      }`}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">






        {/* Mobile menu button that opens or closes the navigation drawer. */}
        {/*Click ☰ → menu opens
          Click ✕ → menu closes */}
        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 text-white hover:text-purple-200 transition focus:outline-none z-10"
        >
          {/*This creates the actual icon.*/}
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>














        {/* Brand logo that links to the homepage and closes the mobile menu when clicked. */}
        <div className="flex-1 md:flex-none text-center md:text-left z-10">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="inline-flex items-center"
          >
            <img
              src="/logo.png"
              alt="Violet Stitch"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>








        {/* Desktop navigation containing Home, Products, and Contact links. */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium z-10">

          {/* Home navigation link. */}
          <Link
            href="/"
            className="hover:text-purple-200 transition"
          >
            Home
          </Link>

          {/* Desktop Products menu that opens when the user hovers over Products. */}
          {/*           the absolute child looks for the nearest parent with position: relative (or another positioned value). */}
          <div
            className="relative"
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-purple-200 transition py-2">
              Products

              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>

            {/* Displays the desktop product categories while the Products menu is open. */}
            {isProductsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-44 bg-white/95 backdrop-blur-md text-gray-800 rounded-xl shadow-xl py-2 border border-purple-100 flex flex-col gap-1 transition-all">

                <Link
                  href="/category/flowers"
                  className="px-4 py-2 hover:bg-purple-50 hover:text-purple-700 text-sm font-medium"
                >
                  Flowers
                </Link>

                <Link
                  href="/category/keychains"
                  className="px-4 py-2 hover:bg-purple-50 hover:text-purple-700 text-sm font-medium"
                >
                  Keychains
                </Link>

                <Link
                  href="/category/others"
                  className="px-4 py-2 hover:bg-purple-50 hover:text-purple-700 text-sm font-medium"
                >
                  Others
                </Link>

              </div>
            )}
          </div>

          {/* Contact navigation link. */}
          <Link
            href="/contact"
            className="hover:text-purple-200 transition"
          >
            Contact
          </Link>
        </nav>




















        {/* Shopping cart link displaying the current number of items in the cart. */}
        <Link
          href="/cart"
          className="relative p-2 text-white hover:text-purple-200 transition flex items-center z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>

          {/* Shows the cart item count when the cart contains at least one item. */}
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-transparent">
              {totalItems}
            </span>
          )}
        </Link>
      </div>




















      {/* Mobile navigation system with a backdrop and sliding drawer. */}

      {/* Dark backdrop that closes the mobile menu when clicked outside the drawer. */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
         // Shows the overlay and allows clicks when the mobile menu is open;
        // otherwise hides the overlay and disables its interaction.
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile navigation drawer that slides in from the left when opened. */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white text-gray-900 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="p-6">

          {/* Mobile drawer header containing the brand name and close button. */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <span className="text-xl font-bold text-purple-950 tracking-wide">
              Violet Stitch<span className="text-purple-600">.</span>
            </span>

            <button
              onClick={closeMobileMenu}
              aria-label="Close Menu"
              className="p-2 rounded-full text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile navigation containing Home, Products, and Contact. */}
          <nav className="flex flex-col space-y-1 mt-6">

            {/* Mobile Home navigation link. */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition"
            >
              Home
            </Link>

            {/* Mobile Products accordion that expands and collapses the product categories. */}
            <div>
              <button
                onClick={() =>
                  setIsMobileProductsOpen((prev) => !prev)
                }
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition"
              >
                <span>Products</span>

                {/* Rotates the arrow when the Products submenu is expanded. */}
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    isMobileProductsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Displays the mobile product categories when the Products accordion is open. */}
              {isMobileProductsOpen && (
                <div className="ml-4 pl-2 border-l-2 border-purple-100 flex flex-col space-y-1 mt-1">

                  <Link
                    href="/category/flowers"
                    onClick={closeMobileMenu}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition"
                  >
                    Flowers
                  </Link>

                  <Link
                    href="/category/keychains"
                    onClick={closeMobileMenu}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition"
                  >
                    Keychains
                  </Link>

                  <Link
                    href="/category/clothes"
                    onClick={closeMobileMenu}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition"
                  >
                    Clothes
                  </Link>

                  <Link
                    href="/category/others"
                    onClick={closeMobileMenu}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition"
                  >
                    Others
                  </Link>

                </div>
              )}
            </div>

            {/* Mobile Contact navigation link. */}
            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-purple-50 hover:text-purple-600 transition"
            >
              Contact
            </Link>

          </nav>
        </div>

        {/* Mobile cart button that closes the drawer and takes the user to the cart. */}
        <div className="p-6 border-t border-gray-100 bg-purple-50/50">
          <Link
            href="/cart"
            onClick={closeMobileMenu}
            className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>

            <span>View Cart ({totalItems})</span>
          </Link>
        </div>

      </aside>
    </header>
  )
}