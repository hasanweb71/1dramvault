import React from 'react';
import { ExternalLink, Mail, MessageCircle, Twitter, Github, Shield, Award, Users } from 'lucide-react';
import { useTokenData } from '../hooks/useTokenData';

export default function Footer() {
  const { data: tokenData, loading } = useTokenData();

  const socialLinks = [
    { name: 'Telegram', icon: MessageCircle, href: 'https://t.me/OneDreamToken', color: 'hover:text-blue-400' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-400' },
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-400' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@1dream.io', color: 'hover:text-green-400' }
  ];

  const quickLinks = [
    { name: 'Whitepaper', href: '#' },
    { name: 'Audit Report', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Support', href: '#' }
  ];

  const stats = [
    { label: 'Security Score', value: '98/100', icon: Shield },
    { label: 'Community Rating', value: '4.9/5', icon: Award },
    { label: 'Circulating Supply', value: loading ? '...' : tokenData.circulating, icon: Users }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <img 
                  src="https://exnai.com/wp-content/uploads/2025/09/1-Dream-Logo.png" 
                  alt="1DREAM Logo" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span className="text-white font-bold text-sm hidden">1D</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">1DREAM</h3>
                <p className="text-sm text-gray-300">Staking Platform</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Building the future of decentralized finance through innovative staking solutions, 
              community governance, and sustainable tokenomics.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-700 ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Stats */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6">Platform Stats</h4>
            <div className="space-y-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        stat.hasError ? 'text-red-400 text-xs' : 'text-white'
                      }`}>
                        {stat.value}
                      </p>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-bold mb-6">Stay Updated</h4>
            <p className="text-gray-300 mb-4">
              Get the latest updates on 1DREAM development, new features, and community events.
            </p>
            
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-r-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Info Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-400">SC:</span>
              <code className="text-blue-400 font-mono text-xs sm:text-sm break-all sm:break-normal">0x0C98F3e79061E0dB9569cd2574d8aac0d5023965</code>
              <button className="text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
              <span>Network: BSC</span>
              <span>•</span>
              <span>Tax: 4%</span>
              <span>•</span>
              <span className="whitespace-nowrap">Supply: 888,888</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 1DREAM. All rights reserved. Built with ❤️ for the DeFi community.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400">Platform Status: Online</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">Audited & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}