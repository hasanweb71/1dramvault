import React from 'react';
import { Plus, Filter, Search, TrendingUp, TrendingDown, MoreHorizontal, Star } from 'lucide-react';

export default function Portfolio() {
  const [filter, setFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const positions = [
    {
      id: 1,
      symbol: 'ETH',
      name: 'Ethereum',
      logo: '🔷',
      balance: 12.5647,
      price: 1876.45,
      value: 23547.89,
      change24h: 5.67,
      allocation: 42.3,
      status: 'holding'
    },
    {
      id: 2,
      symbol: 'BTC',
      name: 'Bitcoin',
      logo: '₿',
      balance: 0.8543,
      price: 21345.67,
      value: 18234.56,
      change24h: -2.34,
      allocation: 32.8,
      status: 'holding'
    },
    {
      id: 3,
      symbol: 'USDC',
      name: 'USD Coin',
      logo: '💲',
      balance: 5000.00,
      price: 1.00,
      value: 5000.00,
      change24h: 0.01,
      allocation: 9.0,
      status: 'stable'
    },
    {
      id: 4,
      symbol: 'MATIC',
      name: 'Polygon',
      logo: '🟣',
      balance: 8750.34,
      price: 0.456,
      value: 3987.44,
      change24h: 12.45,
      allocation: 7.2,
      status: 'staked'
    },
    {
      id: 5,
      symbol: 'LINK',
      name: 'Chainlink',
      logo: '🔗',
      balance: 234.67,
      price: 6.78,
      value: 1591.06,
      change24h: 8.23,
      allocation: 2.9,
      status: 'holding'
    },
    {
      id: 6,
      symbol: 'UNI',
      name: 'Uniswap',
      logo: '🦄',
      balance: 145.23,
      price: 5.43,
      value: 788.60,
      change24h: -4.56,
      allocation: 1.4,
      status: 'holding'
    }
  ];

  const filteredPositions = positions.filter(position => {
    if (filter !== 'all' && position.status !== filter) return false;
    if (searchTerm && !position.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !position.symbol.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalPortfolioValue = positions.reduce((sum, pos) => sum + pos.value, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
            <p className="text-slate-400">Manage your digital asset positions</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Asset</span>
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Portfolio Value</h3>
            <div className="text-3xl font-bold text-white mb-1">
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+5.67% (24h)</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Best Performer</h3>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">🟣</span>
              <span className="text-xl font-bold text-white">MATIC</span>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12.45%</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Asset Count</h3>
            <div className="text-3xl font-bold text-white mb-1">{positions.length}</div>
            <div className="text-slate-400 text-sm">Across multiple chains</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg p-1">
              {['all', 'holding', 'staked', 'stable'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                    filter === filterOption
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <button className="bg-slate-700/50 border border-slate-600 text-slate-300 p-2 rounded-lg hover:bg-slate-700 transition-all duration-200">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Portfolio Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Asset</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Value</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">24h Change</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Allocation</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredPositions.map((position) => (
                  <tr key={position.id} className="hover:bg-slate-700/20 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{position.logo}</span>
                        <div>
                          <div className="font-semibold text-white">{position.symbol}</div>
                          <div className="text-sm text-slate-400">{position.name}</div>
                        </div>
                        <Star className="w-4 h-4 text-slate-500 hover:text-yellow-400 cursor-pointer transition-colors" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        {position.balance.toFixed(position.symbol === 'BTC' ? 4 : 2)}
                      </div>
                      <div className="text-sm text-slate-400">{position.symbol}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        ${position.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">
                        ${position.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center space-x-1 ${
                        position.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {position.change24h >= 0 ? '+' : ''}{position.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="bg-slate-700 rounded-full h-2 w-16 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                            style={{ width: `${Math.min(position.allocation, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-400">{position.allocation.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        position.status === 'staked' 
                          ? 'bg-green-400/20 text-green-400'
                          : position.status === 'stable'
                          ? 'bg-blue-400/20 text-blue-400'
                          : 'bg-slate-600/20 text-slate-400'
                      }`}>
                        {position.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-white p-1 rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}