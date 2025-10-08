import React from 'react';
import { ArrowRight, Shield, Zap, Globe, TrendingUp, Users, Lock } from 'lucide-react';

export default function Hero() {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Trustless',
      description: 'Built on blockchain technology with military-grade security'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Execute trades and transactions in milliseconds'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Access DeFi from anywhere in the world, 24/7'
    }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$2.4B+' },
    { label: 'Active Users', value: '150K+' },
    { label: 'Supported Chains', value: '12+' },
    { label: 'Daily Transactions', value: '500K+' }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent mb-6 leading-tight">
              The Future of
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Decentralized Finance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience the next generation of DeFi with our cutting-edge platform. 
              Trade, stake, and manage your digital assets with unprecedented security and efficiency.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-2xl hover:shadow-blue-500/25 flex items-center space-x-3 group">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="border border-slate-600 text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-700/30 hover:text-white transition-all duration-200 backdrop-blur-sm">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm md:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose DreamWave?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built for the future of finance with cutting-edge technology and user-centric design
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 group hover:bg-slate-800/70"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-200">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Advanced Trading</h4>
              <p className="text-slate-400 text-sm">Professional trading tools with real-time analytics</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-200">
              <Users className="w-8 h-8 text-cyan-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Community Driven</h4>
              <p className="text-slate-400 text-sm">Governed by the community with transparent voting</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:border-green-500/30 transition-all duration-200 md:col-span-2 lg:col-span-1">
              <Lock className="w-8 h-8 text-green-400 mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Multi-Sig Security</h4>
              <p className="text-slate-400 text-sm">Enhanced security with multi-signature wallets</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}