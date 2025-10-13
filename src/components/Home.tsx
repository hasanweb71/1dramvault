import React from 'react';
import { TrendingUp, Users, Shield, Zap, ExternalLink, Copy, Check } from 'lucide-react';
import { useTokenStats } from '../hooks/useTokenStats';

export default function Home() {
  const [copiedCA, setCopiedCA] = React.useState(false);
  const tokenStatsData = useTokenStats();

  const tokenStats = [
    {
      label: 'Max Supply',
      value: tokenStatsData.maxSupply,
      detail: 'Total tokens ever created',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Burned',
      value: tokenStatsData.burned,
      detail: 'Tokens permanently removed',
      icon: Zap,
      color: 'from-red-500 to-red-600'
    },
    {
      label: 'Circulating',
      value: tokenStatsData.circulating,
      detail: 'Tokens in active circulation',
      icon: Users,
      color: 'from-green-500 to-green-600'
    }
  ];

  const socialLinks = [
    { label: 'Telegram', href: 'https://t.me/OneDreamToken', icon: '📱', color: 'from-blue-500 to-blue-600' },
    { label: 'Twitter', href: '#', icon: '🐦', color: 'from-sky-500 to-sky-600' },
    { label: 'CoinMarketCap', href: '#', icon: '📊', color: 'from-yellow-500 to-yellow-600' },
    { label: 'CoinGecko', href: '#', icon: '🦎', color: 'from-green-500 to-green-600' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Multi-signature wallets and audited smart contracts'
    },
    {
      icon: TrendingUp,
      title: 'Deflationary Model',
      description: 'Token burns reduce supply and increase scarcity'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Listing Crypto Research Market Platform'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Token Info */}
          <div className="space-y-8">
            {/* Token Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {tokenStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900 mb-1">{stat.label}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {tokenStatsData.loading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">{stat.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Token Description */}
            <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
              <h2 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
                1DREAM Token
              </h2>
              <p className="text-xl text-slate-300 dark:text-slate-300 light:text-gray-700 mb-6 leading-relaxed">
                Built for <span className="text-blue-600 font-semibold">Security</span>, 
                <span className="text-red-600 font-semibold"> Deflation</span>, 
                <span className="text-green-600 font-semibold"> Rewards</span> and 
                <span className="text-purple-600 font-semibold"> unstoppable growth</span>
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="text-center p-4 rounded-xl bg-slate-700/30 dark:bg-slate-700/30 light:bg-gray-50 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-100 transition-colors">
                      <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-white dark:text-white light:text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r ${link.color} text-white font-medium hover:shadow-lg transition-all duration-200 text-sm`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Logo and Details */}
          <div className="space-y-8">
            {/* Large Logo */}
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <img 
                  src="https://exnai.com/wp-content/uploads/2025/09/1-Dream-Logo.png" 
                  alt="1DREAM Logo" 
                  className="w-64 h-64 object-contain animate-spin"
                  style={{ animationDuration: '10s' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span className="text-white font-bold text-6xl hidden">1DREAM</span>
              </div>
            </div>

            {/* Token Details */}
            <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100 space-y-6">
              {/* Contract Address */}
              <div className="bg-slate-700/30 dark:bg-slate-700/30 light:bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white dark:text-white light:text-gray-900">Contract Address</h3>
                  <button
                    onClick={() => copyToClipboard('0x0C98F3e79061E0dB9569cd2574d8aac0d5023965')}
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {copiedCA ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copiedCA ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm font-mono text-slate-300 dark:text-slate-300 light:text-gray-700 break-all">
                  0x0C98F3e79061E0dB9569cd2574d8aac0d5023965
                </p>
              </div>

              {/* Tokenomics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
                  <span className="font-medium text-slate-400 dark:text-slate-400 light:text-gray-700">Tokenomics</span>
                  <span className="text-white dark:text-white light:text-gray-900 font-semibold">90% Community | 10% Dapps Funds</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
                  <span className="font-medium text-slate-400 dark:text-slate-400 light:text-gray-700">Transaction Tax</span>
                  <span className="text-white dark:text-white light:text-gray-900 font-semibold">4% Buy/Sell</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="font-medium text-slate-400 dark:text-slate-400 light:text-gray-700">Network</span>
                  <span className="text-white dark:text-white light:text-gray-900 font-semibold">Binance Smart Chain</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 dark:from-blue-900/20 dark:to-indigo-900/20 light:from-blue-50 light:to-indigo-50 rounded-xl p-4">
                <h4 className="text-white dark:text-white light:text-gray-900 font-semibold mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <a
                    href="https://pancakeswap.finance/swap?outputCurrency=0x0C98F3e79061E0dB9569cd2574d8aac0d5023965"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="text-slate-300 text-sm">Buy on PancakeSwap</span>
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                  </a>
                  <a
                    href="https://bscscan.com/token/0x0C98F3e79061E0dB9569cd2574d8aac0d5023965"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="text-slate-300 text-sm">View on BSCScan</span>
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}