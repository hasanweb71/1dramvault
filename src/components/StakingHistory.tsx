import React from 'react';
import { ArrowLeft, Clock, TrendingUp, Calendar, Filter, Search, Download, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useStakingData } from '../hooks/useStakingData';

interface StakingHistoryProps {
  isWalletConnected: boolean;
  walletAddress: string;
  setActiveView: (view: 'home' | 'trade' | 'dapps' | 'roadmap' | 'defi' | 'stakingHistory') => void;
  onWalletConnect: () => void;
}

interface StakingHistoryItem {
  id: number;
  type: 'stake' | 'claim' | 'unstake';
  planName: string;
  amount: string;
  timestamp: string;
  txHash: string;
  status: string;
  apy: string;
}

export default function StakingHistory({ isWalletConnected, walletAddress, setActiveView, onWalletConnect }: StakingHistoryProps) {
  const [showAmounts, setShowAmounts] = React.useState(true);
  const [filterType, setFilterType] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [stakingHistory, setStakingHistory] = React.useState<StakingHistoryItem[]>([]);

  const { userStakingData, stakingPlans, refreshUserData } = useStakingData();

  // Fetch user data when wallet connects
  React.useEffect(() => {
    if (isWalletConnected && walletAddress) {
      refreshUserData(walletAddress);
    }
  }, [isWalletConnected, walletAddress, refreshUserData]);

  // Transform user stakes into history items (current active stakes)
  React.useEffect(() => {
    if (userStakingData && userStakingData.stakes.length > 0) {
      const historyItems: StakingHistoryItem[] = userStakingData.stakes.map((stake, index) => {
        const plan = stakingPlans.find(p => p.id === stake.planId);
        return {
          id: index,
          type: 'stake',
          planName: stake.planName,
          amount: stake.amount,
          timestamp: new Date(stake.startTime * 1000).toISOString(),
          txHash: '0x' + '0'.repeat(62) + index.toString().padStart(4, '0'),
          status: 'active',
          apy: plan?.apy || '0%'
        };
      });
      setStakingHistory(historyItems);
    } else {
      setStakingHistory([]);
    }
  }, [userStakingData, stakingPlans]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stake':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'unstake':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      case 'claim':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stake':
        return 'bg-green-600/20 text-green-400';
      case 'unstake':
        return 'bg-red-600/20 text-red-400';
      case 'claim':
        return 'bg-blue-600/20 text-blue-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  };

  const filteredHistory = stakingHistory.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchTerm && !item.planName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveView('dapps')}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Staking History</h1>
              <p className="text-xl text-slate-400">Track your staking activities and rewards</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (isWalletConnected && walletAddress) {
                  refreshUserData(walletAddress);
                }
              }}
              disabled={!isWalletConnected}
              className="flex items-center space-x-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowAmounts(!showAmounts)}
              className="flex items-center space-x-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {showAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAmounts ? 'Hide' : 'Show'} Amounts</span>
            </button>
          </div>
        </div>

        {/* Wallet Connection Check */}
        {!isWalletConnected ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 text-center">
            <Clock className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
            <p className="text-slate-400 mb-6">
              Connect your wallet to view your staking history
            </p>
            <button
              onClick={onWalletConnect}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg p-1">
                  {['all', 'stake', 'unstake', 'claim'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                        filterType === type
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search plans..."
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

            {/* History Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Plan</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">APY</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Transaction</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {getTypeIcon(item.type)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{item.planName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">
                            {showAmounts ? `${item.amount} 1DREAM` : '****'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-green-400 font-medium">{item.apy}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-300">{formatDate(item.timestamp)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`https://bscscan.com/tx/${item.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                          >
                            {formatAddress(item.txHash)}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredHistory.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No staking history found</p>
                  <p className="text-slate-500 text-sm">Your staking activities will appear here</p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Total Staked</h3>
                <p className="text-2xl font-bold text-white">
                  {showAmounts ? (userStakingData ? `${userStakingData.totalStakedAmount} 1DREAM` : '0.00 1DREAM') : '****'}
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Pending Rewards</h3>
                <p className="text-2xl font-bold text-green-400">
                  {showAmounts ? (userStakingData ? `${userStakingData.pendingRewardsTotal} 1DREAM` : '0.00 1DREAM') : '****'}
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Active Stakes</h3>
                <p className="text-2xl font-bold text-blue-400">
                  {userStakingData ? userStakingData.activeStakesCount : 0}
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Referral Earnings</h3>
                <p className="text-2xl font-bold text-purple-400">
                  {showAmounts ? (userStakingData ? `${userStakingData.totalReferralEarnings} 1DREAM` : '0.00 1DREAM') : '****'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}