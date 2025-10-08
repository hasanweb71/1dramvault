import React from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, Clock, Settings, RefreshCw, Zap } from 'lucide-react';

export default function Trading() {
  const [selectedPair, setSelectedPair] = React.useState('ETH/USDC');
  const [orderType, setOrderType] = React.useState<'market' | 'limit'>('market');
  const [tradeType, setTradeType] = React.useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = React.useState('');
  const [price, setPrice] = React.useState('');

  const tradingPairs = [
    { symbol: 'ETH/USDC', price: 1876.45, change: 5.67, volume: '234.5M' },
    { symbol: 'BTC/USDC', price: 21345.67, change: -2.34, volume: '456.7M' },
    { symbol: 'MATIC/USDC', price: 0.456, change: 12.45, volume: '89.2M' },
    { symbol: 'LINK/USDC', price: 6.78, change: 8.23, volume: '45.6M' }
  ];

  const recentTrades = [
    { price: 1876.45, amount: 2.5, time: '14:32:15', type: 'buy' },
    { price: 1875.32, amount: 1.8, time: '14:31:45', type: 'sell' },
    { price: 1877.89, amount: 3.2, time: '14:31:20', type: 'buy' },
    { price: 1876.12, amount: 0.9, time: '14:30:55', type: 'sell' },
    { price: 1878.45, amount: 1.5, time: '14:30:30', type: 'buy' }
  ];

  const openOrders = [
    { id: 1, pair: 'ETH/USDC', type: 'buy', amount: 2.5, price: 1850.00, status: 'pending' },
    { id: 2, pair: 'BTC/USDC', type: 'sell', amount: 0.5, price: 22000.00, status: 'pending' }
  ];

  const currentPair = tradingPairs.find(pair => pair.symbol === selectedPair) || tradingPairs[0];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trading</h1>
            <p className="text-slate-400">Trade your favorite digital assets</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-slate-700/50 border border-slate-600 text-slate-300 p-2 rounded-lg hover:bg-slate-700 transition-all duration-200">
              <Settings className="w-4 h-4" />
            </button>
            <button className="bg-slate-700/50 border border-slate-600 text-slate-300 p-2 rounded-lg hover:bg-slate-700 transition-all duration-200">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Trading Pairs */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Trading Pairs</h2>
              
              <div className="space-y-2">
                {tradingPairs.map((pair) => (
                  <button
                    key={pair.symbol}
                    onClick={() => setSelectedPair(pair.symbol)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedPair === pair.symbol
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{pair.symbol}</span>
                      <span className={`text-sm ${
                        pair.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">${pair.price.toLocaleString()}</span>
                      <span className="text-slate-500">Vol: {pair.volume}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Display */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedPair}</h2>
                <div className={`flex items-center space-x-2 ${
                  currentPair.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {currentPair.change >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {currentPair.change >= 0 ? '+' : ''}{currentPair.change.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-white mb-2">
                ${currentPair.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              
              <div className="text-slate-400">
                24h Volume: {currentPair.volume}
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-80">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">Trading chart will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Trading Form */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex bg-slate-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setTradeType('buy')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      tradeType === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeType('sell')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      tradeType === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Sell
                  </button>
                </div>
                
                <div className="flex bg-slate-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setOrderType('market')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      orderType === 'market'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setOrderType('limit')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      orderType === 'limit'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Price (USDC)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Available Balance:</span>
                  <span>12.5647 ETH</span>
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                    tradeType === 'buy'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Order Book & Recent Trades */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Trades */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Trades</h2>
              
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-sm text-slate-400 pb-2 border-b border-slate-700">
                  <span>Price</span>
                  <span>Amount</span>
                  <span>Time</span>
                </div>
                
                {recentTrades.map((trade, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 text-sm py-1">
                    <span className={trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                      ${trade.price.toFixed(2)}
                    </span>
                    <span className="text-white">{trade.amount.toFixed(2)}</span>
                    <span className="text-slate-400">{trade.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Orders */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Open Orders</h2>
              
              {openOrders.length > 0 ? (
                <div className="space-y-3">
                  {openOrders.map((order) => (
                    <div key={order.id} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{order.pair}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.type === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {order.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        <div>Amount: {order.amount} ETH</div>
                        <div>Price: ${order.price.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No open orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}