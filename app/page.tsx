'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Package, Search, Phone, Mail, MessageCircle, CheckCircle, Star, Users, Shield, ShoppingCart, Globe, Home as HomeIcon, User2, Copy } from 'lucide-react';
import { Product } from '@/lib/types';
// REMOVE: import { Navigation } from '@/components/layout/Navigation';

function copyToClipboard(text: string, setTooltip: (tooltip: string) => void) {
  navigator.clipboard.writeText(text);
  setTooltip('Copied!');
  setTimeout(() => setTooltip('Copy'), 1200);
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load products once
  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch(error => {
        console.error('Error fetching products:', error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter as search changes
  useEffect(() => {
    const query = search.trim().toLowerCase();
    if (query === '') {
      setFiltered([]);
      setSearched(false);
      return;
    }
    setFiltered(
      products.filter((p: Product) =>
        p.productName.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.type ? p.type.toLowerCase().includes(query) : false)
      )
    );
    setSearched(true);
  }, [search, products]);

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Home Navigation Bar */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-primary-100 shadow-lg fixed top-0 left-0 z-50 flex items-center h-16 px-4 lg:px-8 transition-all duration-300 sticky">
        <div className="flex items-center gap-2">
          <HomeIcon className="w-7 h-7 text-primary-600" />
          <span className="text-xs sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Rich Auto Parts</span>
      </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <a href="#search" className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700 hover:text-primary-700 transition-colors">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" /> Search Product
          </a>
          <a href="#contact" className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700 hover:text-primary-700 transition-colors">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5" /> Contact
          </a>
        </div>
      </nav>
      <div className="pt-20">
      {/* Hero Section */}
        <section className="relative z-10 px-6 pt-8 pb-12 text-center bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">Welcome to Rich Auto Parts</h1>
              <p className="text-lg md:text-xl text-gray-700 mb-2">Your trusted shop for quality car spare parts and smart inventory management.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
              <a href="#search" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg">Search Products</a>
              <a href="#contact" className="px-8 py-3 border-2 border-purple-400 text-purple-400 font-bold rounded-xl text-lg hover:bg-purple-400 hover:text-white transition-all duration-300 hover:scale-105">Contact Us</a>
            </div>
          </div>
        </section>

        {/* Product Search Section */}
        <section id="search" className="relative z-10 px-6 py-16 bg-white rounded-3xl max-w-3xl mx-auto mt-8 border border-primary-100 shadow-lg">
          <h2 className="text-3xl font-bold text-primary-700 mb-6 text-center">Check Product Availability</h2>
          <div className="flex items-center gap-3 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by product name, category, or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-400 text-lg transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              </div>
          </div>
          {loading && <div className="text-center text-gray-400">Searching...</div>}
          {searched && (
            <div className="mt-6">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed divide-y divide-gray-200 bg-white rounded-xl">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/2">Product</th>
                        <th className="hidden sm:table-cell px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/4">Type</th>
                        <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase w-1/4">Quantity Left</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filtered.map((product, idx) => (
                        <tr key={idx} className="hover:bg-primary-50 transition-colors">
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-none">{product.productName}</td>
                          <td className="hidden sm:table-cell px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-gray-700">{product.category}</td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-gray-700 text-xs sm:text-sm">{product.type || '-'}</td>
                          <td className={`px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap font-bold text-xs sm:text-sm ${product.quantity <= product.minimumStock ? 'text-red-600' : 'text-green-700'}`}>{product.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-red-400 font-semibold text-lg">No matching product found in stock.</div>
              )}
                </div>
          )}
      </section>

        {/* Staff/Owner Login Prompt */}
        <section className="relative z-10 px-6 py-8 max-w-3xl mx-auto">
          <div className="bg-primary-50 border border-primary-100 rounded-2xl shadow flex flex-col items-center py-8">
            <h3 className="text-lg font-semibold text-primary-700 mb-2">Are you staff?</h3>
            <a href="/login" className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl text-lg hover:bg-primary-700 transition-all duration-300 shadow">Login</a>
        </div>
      </section>

        {/* Shop Marketing Section */}
        <section className="relative z-10 px-6 py-20 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary-50 rounded-3xl p-8 border border-primary-100 hover:border-primary-400 transition-all duration-500 text-center shadow">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary-700 mb-2">Genuine Spare Parts</h3>
              <p className="text-gray-600">We stock only authentic, high-quality car parts for your peace of mind.</p>
            </div>
            <div className="bg-primary-50 rounded-3xl p-8 border border-primary-100 hover:border-primary-400 transition-all duration-500 text-center shadow">
              <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary-700 mb-2">Trusted by Many</h3>
              <p className="text-gray-600">Hundreds of happy customers rely on us for their automotive needs.</p>
                </div>
            <div className="bg-primary-50 rounded-3xl p-8 border border-primary-100 hover:border-primary-400 transition-all duration-500 text-center shadow">
              <Globe className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary-700 mb-2">Smart, Modern Service</h3>
              <p className="text-gray-600">Experience seamless, tech-driven service and support for your shop.</p>
                </div>
              </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" className="relative z-10 px-6 py-20 bg-gradient-to-br from-primary-50/80 via-white/90 to-primary-100/80 rounded-3xl max-w-3xl mx-auto border border-primary-100 shadow-2xl mt-8 glass">
          <h2 className="text-3xl font-bold text-primary-700 mb-2 text-center flex items-center justify-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-500 animate-bounce" /> Contact Us
          </h2>
          <p className="text-center text-gray-500 mb-10 text-lg">Contact us anytime! We're here to help you with your automotive needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* WhatsApp */}
            <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg p-6 border border-primary-100 hover:shadow-xl transition-all duration-300 group">
              <a href="https://wa.me/255655206601" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-green-600 hover:text-green-700 transition-colors">
                <div className="bg-green-100 p-4 rounded-full mb-2 group-hover:scale-110 transition-transform"><MessageCircle className="w-8 h-8" /></div>
                <span className="font-semibold text-lg">WhatsApp</span>
                <span className="text-gray-500">Chat with us</span>
              </a>
            </div>
            {/* Phone */}
            <ContactCopyCard
              icon={<Phone className="w-8 h-8" />}
              label="Call"
              value="0655 206 601"
              href="tel:0655206601"
              color="blue"
            />
            {/* Email */}
            <ContactCopyCard
              icon={<Mail className="w-8 h-8" />}
              label="Email"
              value="allymohammedsaid126@gmail.com"
              href="mailto:allymohammedsaid126@gmail.com"
              color="purple"
              valueClassName="break-all max-w-[180px] text-center"
            />
          </div>
          <div className="flex justify-center gap-6 mt-10">
            <div className="flex flex-col items-center">
              <User2 className="w-6 h-6 text-primary-400 mb-1" />
              <span className="text-xs text-gray-500">Owner: Ally Mohammed</span>
        </div>
            <div className="flex flex-col items-center">
              <Globe className="w-6 h-6 text-primary-400 mb-1" />
              <span className="text-xs text-gray-500">Dar es Salaam, Tanzania</span>
          </div>
        </div>
      </section>

      {/* Footer */}
        <footer className="relative z-10 px-6 py-12 border-t border-primary-100 mt-12 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Rich Auto Parts
            </span>
          </div>
            <p className="text-gray-400 mb-4">© 2024 Rich Auto Parts. All rights reserved.</p>
          </div>
        </footer>
          </div>
        </div>
  );
}

// ContactCopyCard component
function ContactCopyCard({ icon, label, value, href, color, valueClassName = '' }: { icon: React.ReactNode, label: string, value: string, href: string, color: string, valueClassName?: string }) {
  const [tooltip, setTooltip] = useState('Copy');
  return (
    <div className={`flex flex-col items-center bg-white/80 rounded-2xl shadow-lg p-6 border border-primary-100 hover:shadow-xl transition-all duration-300 group`}> 
      <a href={href} className={`flex flex-col items-center gap-2 text-${color}-600 hover:text-${color}-700 transition-colors`}>
        <div className={`bg-${color}-100 p-4 rounded-full mb-2 group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className="font-semibold text-lg">{label}</span>
        <span className={`text-gray-500 ${valueClassName}`}>{value}</span>
      </a>
      <button
        onClick={() => copyToClipboard(value, setTooltip)}
        className={`mt-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-${color}-50 text-${color}-700 hover:bg-${color}-200 text-xs font-medium shadow transition-all`}
        title={tooltip}
        onMouseLeave={() => setTooltip('Copy')}
      >
        <Copy className="w-4 h-4" /> {tooltip}
      </button>
    </div>
  );
}
