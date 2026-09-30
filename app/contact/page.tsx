"use client"

import { useState } from "react"

import {
  Mail,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react"

// TikTok SVG Icon
const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.53-1.29 2.53-.02 1.08.51 2.13 1.41 2.73.91.6 2.12.69 3.09.24.96-.43 1.63-1.37 1.78-2.42.06-2.14.03-4.29.04-6.44.01-4.08.01-8.16.02-12.24z" />
  </svg>
)

// Instagram SVG Icon
const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

export default function ContactPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const contactDetails = {
    email: "contact.violetstitch@gmail.com",
    phone: "+213 555 12 34 56",
    phoneRaw: "+213555123456",
    instagram: "@violet.stitch",
    instagramUrl: "https://instagram.com/violet.stitch",
    tiktok: "@violetstitch.dz",
    tiktokUrl: "https://tiktok.com/@violetstitch.dz",
    location: "Algeria (Nationwide Delivery)",
    hours: "Sun - Thu: 9:00 AM - 7:00 PM",
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)

    setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-purple-900 via-purple-850 to-purple-900 text-white py-14 px-6 text-center border-b border-purple-800">
        <div className="max-w-4xl mx-auto">


          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            We’d Love to Hear From You
          </h1>



        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">

        {/* Contact Information */}
        <div className="space-y-6">

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm space-y-6">

            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Direct Contact Info
              </h2>

              <p className="text-xs text-purple-600 font-medium mt-1">
                Fast response via phone, email, or social messaging
              </p>
            </div>

            <div className="space-y-4">

              {/* Email */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-200 transition">

                <div className="flex items-center space-x-3.5 overflow-hidden">

                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>

                  <div className="truncate">

                    <p className="text-xs text-gray-500 font-medium">
                      Email Address
                    </p>

                    <a
                      href={`mailto:${contactDetails.email}`}
                      className="text-sm font-semibold text-gray-900 hover:text-purple-600 transition truncate block"
                    >
                      {contactDetails.email}
                    </a>

                  </div>

                </div>

                <button
                  onClick={() => handleCopy(contactDetails.email, "email")}
                  title="Copy Email"
                  className="p-2 text-gray-400 hover:text-purple-600 transition flex-shrink-0"
                >
                  {copied === "email" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-200 transition">

                <div className="flex items-center space-x-3.5">

                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>

                  <div>

                    <p className="text-xs text-gray-500 font-medium">
                      Phone & WhatsApp
                    </p>

                    <a
                      href={`tel:${contactDetails.phoneRaw}`}
                      className="text-sm font-semibold text-gray-900 hover:text-purple-600 transition block"
                    >
                      {contactDetails.phone}
                    </a>

                  </div>

                </div>

                <button
                  onClick={() => handleCopy(contactDetails.phone, "phone")}
                  title="Copy Phone Number"
                  className="p-2 text-gray-400 hover:text-purple-600 transition flex-shrink-0"
                >
                  {copied === "phone" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

              </div>

            </div>

            <hr className="border-purple-100" />

            {/* Social Media */}
            <div>

              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Follow Our Handmade Journey
              </h3>

              <div className="grid grid-cols-2 gap-3">

                {/* Instagram */}
                <a
                  href={contactDetails.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/60 transition group"
                >
                  <div className="flex items-center space-x-2.5">

                    <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                      <InstagramIcon className="w-4 h-4" />
                    </div>

                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-medium leading-none">
                        Instagram
                      </p>

                      <p className="text-xs font-bold text-gray-900 group-hover:text-purple-700 mt-1">
                        {contactDetails.instagram}
                      </p>
                    </div>

                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600" />
                </a>

                {/* TikTok */}
                <a
                  href={contactDetails.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/60 transition group"
                >
                  <div className="flex items-center space-x-2.5">

                    <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                      <TikTokIcon className="w-4 h-4" />
                    </div>

                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-medium leading-none">
                        TikTok
                      </p>

                      <p className="text-xs font-bold text-gray-900 group-hover:text-purple-700 mt-1">
                        {contactDetails.tiktok}
                      </p>
                    </div>

                  </div>

                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600" />
                </a>

              </div>
            </div>

          </div>

          {/* Location & Hours */}
          <div className="bg-purple-900 text-white rounded-3xl p-6 md:p-8 shadow-sm space-y-4">

            <div className="flex items-center space-x-3">

              <MapPin className="w-5 h-5 text-purple-300" />

              <div>
                <h4 className="text-sm font-bold">
                  {contactDetails.location}
                </h4>

                <p className="text-xs text-purple-200">
                  Handcrafted with care
                </p>
              </div>

            </div>

            <div className="flex items-center space-x-3 pt-2 border-t border-purple-800">

              <Clock className="w-5 h-5 text-purple-300" />

              <div>
                <h4 className="text-sm font-bold">
                  Working Hours
                </h4>

                <p className="text-xs text-purple-200">
                  {contactDetails.hours}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}