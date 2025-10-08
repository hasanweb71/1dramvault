import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';

export default function Dashboard() {
  const [showBalances, setShowBalances] = React.useState(true);

  const portfolioData = {
    totalBalance: 45678.90,
    change24h: 8.45,
    changePercent: 2.34
  };

  const assets = [
    { symbol: 'ETH', name: 'Ethereum', balance: 12.5, value: 23456.78, change: 5.67, logo: '🔷' },
    { symbol: 'BTC', name: 'Bitcoin', balance: 0.85, value: 18234.56, change: -2.34, logo: '₿' },
    { symbol: 'USDC', name: 'USD Coin', balance: 5000, value: 5000.00, change: 0.01, logo: '💲' },
    { symbol: 'MATIC', name: 'Polygon', balance: 8750, value: 3987.44, change: 12.45, logo: '🟣' }
  ];

  const recentTransactions = [
    { type: 'buy', asset: 'ETH', amount: '2.5', value: '$4,567.89', time: '2 hours ago', status: 'completed' },
    { type: 'sell', asset: 'BTC', amount: '0.15', value: '$3,245.67', time: '5 hours ago', status: 'completed' },
    { type: 'stake', asset: 'MATIC', amount: '1,500', value: '$876.34', time: '1 day ago', status: 'pending' },
    { type: 'swap', asset: 'USDC → ETH', amount: '1,000', value: '$1,000.00', time: '2 days ago', status: 'completed' }
  ];

  const formatCurrency = (amount: number) => {
    return showBalances ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '****';
  };

  const formatBalance = (balance: number, decimals: number = 2) => {
    return showBalances ? balance.toFixed(decimals) : '****';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Monitor your portfolio and trading activity</p>
          </div>
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
          </button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Portfolio Overview</h2>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(portfolioData.totalBalance)}
                </div>
                <div className="flex items-center space-x-2">
                  {portfolioData.changePercent >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    portfolioData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {showBalances ? `${portfolioData.changePercent >= 0 ? '+' : ''}${portfolioData.changePercent.toFixed(2)}%` : '****'}
                  </span>
                  <span className="text-slate-400 text-sm">24h</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-xl p-4">
                <PieChart className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-slate-900/50 rounded-xl p-6 h-64 flex items-center justify-center border border-slate-700/30">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-slate-400">Portfolio chart will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Assets</span>
                  <span className="text-white font-medium">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Orders</span>
                  <span className="text-white font-medium">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Staked Assets</span>
                  <span className="text-green-400 font-medium">{formatCurrency(8750.34)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rewards Earned</span>
                  <span className="text-cyan-400 font-medium">{formatCurrency(234.56)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Today's P&L</h3>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {showBalances ? `+$${portfolioData.change24h.toFixed(2)}` : '****'}
              </div>
              <p className="text-green-300 text-sm">Keep up the great work!</p>
            </div>
          </div>
        </div>

        {/* Assets and Transactions */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Assets */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Your Assets</h2>
            
            <div className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{asset.logo}</div>
                    <div>
                      <div className="font-semibold text-white">{asset.symbol}</div>
                      <div className="text-sm text-slate-400">{asset.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {formatBalance(asset.balance, asset.symbol === 'BTC' ? 8 : 2)} {asset.symbol}
                    </div>
                    <div className="text-sm text-slate-400">{formatCurrency(asset.value)}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {asset.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{showBalances ? `${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%` : '****'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Transactions</h2>
            
            <div className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <div className="font-semibold text-white capitalize">{tx.type}</div>
                      <div className="text-sm text-slate-400">{tx.asset}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-white">{showBalances ? tx.amount : '****'}</div>
                    <div className="text-sm text-slate-400">{showBalances ? tx.value : '****'}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-slate-400">{tx.time}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'completed' 
                        ? 'bg-green-400/20 text-green-400' 
                        : 'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}