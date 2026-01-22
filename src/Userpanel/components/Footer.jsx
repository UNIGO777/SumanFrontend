import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react'
import LOGO from '../../assets/LOGO.png'

export default function Footer() {
  return (
    <footer className="bg-[#0f2e40] text-gray-200">
      <div className="mx-auto  px-10 py-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              
              <div className="leading-tight">
                <div className="text-xl font-semibold tracking-wide text-white">SUMAN</div>
                <div className="text-xl font-semibold tracking-wide text-white">9.25</div>
              </div>
            </div>
            <div className="max-w-xs text-sm leading-relaxed text-gray-400">
              Premium jewellery curated for everyday elegance and special moments.
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold text-white">Customer Services</div>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="#" className="block hover:text-white">
                Help &amp; Contact Us
              </a>
              <a href="#" className="block hover:text-white">
                Returns &amp; Refunds
              </a>
              <a href="#" className="block hover:text-white">
                Online Stores
              </a>
              <a href="#" className="block hover:text-white">
                Terms &amp; Conditions
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold text-white">Company</div>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="#" className="block hover:text-white">
                What We Do
              </a>
              <a href="#" className="block hover:text-white">
                Available Services
              </a>
              <a href="#" className="block hover:text-white">
                Latest Posts
              </a>
              <a href="#" className="block hover:text-white">
                FAQs
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold text-white">Contact Us</div>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-300" />
                <span>jewellerymarket@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-300" />
                <span>+1 (234) 567 789</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-300" />
                <span>
                  Jone street 123,
                  <br />
                  New imperial palace
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-400">© {new Date().getFullYear()} All rights reserved</div>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-gray-200 ring-1 ring-white/10 hover:bg-white/10"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-gray-200 ring-1 ring-white/10 hover:bg-white/10"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-gray-200 ring-1 ring-white/10 hover:bg-white/10"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Youtube"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-gray-200 ring-1 ring-white/10 hover:bg-white/10"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

