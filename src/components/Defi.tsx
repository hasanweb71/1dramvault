import React, { useState } from 'react';
import { Lock, Users, TrendingUp, Award, Gift, DollarSign, Calendar, Percent, UserPlus, Star, CheckCircle2, Sparkles, Copy, Link2, Check } from 'lucide-react';

interface DefiProps {
  isWalletConnected: boolean;
  walletAddress: string;
  onWalletConnect: () => void;
}

export default function Defi({ isWalletConnected, walletAddress, onWalletConnect }: DefiProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [referrerAddress, setReferrerAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasActiveStake, setHasActiveStake] = useState(false); // This will come from contract

  // Generate referral link
  const referralLink = `${window.location.origin}?ref=${walletAddress}`;

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check for referrer in URL on mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && ref !== walletAddress) {
      setReferrerAddress(ref);
    }
  }, [walletAddress]);

  const stats = [
    { label: 'Total USDT Stake', value: '0', icon: DollarSign, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Stakers', value: '0', icon: Users, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Daily Rewards', value: '1%', icon: TrendingUp, color: 'from-violet-500 to-violet-600' },
    { label: 'Rewards Paid', value: '0 1Dream', icon: Gift, color: 'from-amber-500 to-amber-600' }
  ];

  const ranks = [
    {
      name: 'Bronze',
      tier: 'Starter',
      minStake: '100',
      maxStake: '500',
      dailyRate: '1%',
      duration: '120',
      referralBonus: '4',
      bgGradient: 'from-amber-900/40 via-amber-800/30 to-amber-900/40',
      borderGradient: 'from-amber-500 via-amber-400 to-amber-600',
      accentColor: 'amber',
      icon: '🥉',
      features: ['Daily 1% rewards', '120-day duration', '+4 days per referral', 'Basic support']
    },
    {
      name: 'Silver',
      tier: 'Growth',
      minStake: '600',
      maxStake: '1000',
      dailyRate: '1%',
      duration: '120',
      referralBonus: '8',
      bgGradient: 'from-slate-700/40 via-slate-600/30 to-slate-700/40',
      borderGradient: 'from-slate-400 via-slate-300 to-slate-500',
      accentColor: 'slate',
      icon: '🥈',
      features: ['Daily 1% rewards', '120-day duration', '+8 days per referral', 'Priority support']
    },
    {
      name: 'Gold',
      tier: 'Premium',
      minStake: '1000',
      maxStake: '5000',
      dailyRate: '1%',
      duration: '120',
      referralBonus: '12',
      bgGradient: 'from-yellow-900/40 via-yellow-700/30 to-yellow-900/40',
      borderGradient: 'from-yellow-400 via-yellow-300 to-yellow-500',
      accentColor: 'yellow',
      icon: '🥇',
      features: ['Daily 1% rewards', '120-day duration', '+12 days per referral', 'VIP support'],
      popular: true
    },
    {
      name: 'Diamond',
      tier: 'Elite',
      minStake: '6000',
      maxStake: '10000',
      dailyRate: '1%',
      duration: '120',
      referralBonus: '15',
      bgGradient: 'from-cyan-900/40 via-blue-800/30 to-cyan-900/40',
      borderGradient: 'from-cyan-400 via-blue-400 to-cyan-500',
      accentColor: 'cyan',
      icon: '💎',
      features: ['Daily 1% rewards', '120-day duration', '+15 days per referral', 'Concierge support']
    }
  ];

  const handleStake = () => {
    if (!isWalletConnected) {
      onWalletConnect();
      return;
    }
    // Functionality will be added later
    console.log('Stake:', stakeAmount, 'Rank:', selectedRank);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title and Description */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            1DREAM VAULT
          </h1>
          <p className="text-lg text-gray-200 max-w-5xl mx-auto leading-relaxed">
            is designed to strengthen our ecosystem by growing the liquidity pool while rewarding our community. By sending USDT
            into the Vault, you directly support deeper liquidity for the 1DREAM token, making trading smoother and more sustainable. In return,
            contributors earn 1DREAM tokens as rewards, creating a win–win system that fuels both stability and growth. The more you participate,
            the stronger our liquidity becomes — and the more you benefit from holding and supporting 1DREAM.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ranks Grid - 2 columns */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-6">
              {ranks.map((rank, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedRank(rank.name)}
                  className={`relative group cursor-pointer transition-all duration-500 ${
                    selectedRank === rank.name ? 'scale-[1.02]' : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* Popular Badge */}
                  {rank.popular && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                        <Star className="w-3 h-3 fill-white" />
                        POPULAR
                      </div>
                    </div>
                  )}

                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${rank.borderGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm ${
                    selectedRank === rank.name ? 'opacity-100' : ''
                  }`}></div>

                  {/* Card Content */}
                  <div className={`relative bg-gradient-to-br ${rank.bgGradient} backdrop-blur-xl rounded-2xl p-6 border-2 ${
                    selectedRank === rank.name
                      ? `border-${rank.accentColor}-400`
                      : 'border-slate-700/50'
                  } overflow-hidden`}>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                      }}></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{rank.icon}</div>
                          <div>
                            <h3 className="text-2xl font-bold text-white leading-tight">{rank.name}</h3>
                            <p className="text-xs text-slate-300 font-medium">{rank.tier} Plan</p>
                          </div>
                        </div>
                        {selectedRank === rank.name && (
                          <CheckCircle2 className="w-7 h-7 text-green-400 animate-in zoom-in duration-300" />
                        )}
                      </div>

                      {/* Stake Range - Prominent */}
                      <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-300">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-medium">Stake Range</span>
                          </div>
                          <div className="text-white font-bold text-lg">
                            ${rank.minStake} - ${rank.maxStake}
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Percent className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-400">Daily Rate</span>
                          </div>
                          <p className="text-white font-bold">{rank.dailyRate}</p>
                        </div>
                        <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-400">Duration</span>
                          </div>
                          <p className="text-white font-bold">{rank.duration} days</p>
                        </div>
                      </div>

                      {/* Referral Bonus */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-lg p-3 mb-4 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <UserPlus className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-blue-300 font-medium">Referral Bonus</span>
                        </div>
                        <p className="text-white text-sm">+{rank.referralBonus} days per referral</p>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2">
                        {rank.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                            <div className={`w-1 h-1 rounded-full bg-${rank.accentColor}-400`}></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Select Button */}
                      {selectedRank === rank.name ? (
                        <div className="mt-4 py-2.5 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-center text-sm font-semibold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Selected
                        </div>
                      ) : (
                        <div className={`mt-4 py-2.5 rounded-lg bg-gradient-to-r ${rank.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity text-slate-900 text-center text-sm font-semibold`}>
                          Select Plan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stake User Details - Right side */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 sticky top-24 shadow-2xl">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Stake Details</h3>
              </div>

              {!isWalletConnected ? (
                <div className="text-center py-10">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                    <Lock className="relative w-16 h-16 text-blue-400 mx-auto" />
                  </div>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Connect your wallet to start staking and earn rewards
                  </p>
                  <button
                    onClick={onWalletConnect}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Wallet Address */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Connected Wallet</label>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-sm text-white font-mono flex items-center justify-between group hover:border-blue-500/50 transition-colors">
                      <span>{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Referral Link (Show if user has active stake) */}
                  {hasActiveStake && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Your Referral Link</label>
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-blue-300 font-medium">Share to earn bonus days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={referralLink}
                            readOnly
                            className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                          />
                          <button
                            onClick={copyReferralLink}
                            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-xs font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span className="text-xs font-medium">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stake Amount Input */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Stake Amount</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">USDT</span>
                      </div>
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-20 pr-4 py-3.5 text-white text-lg font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Referrer Address Input (Optional) */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
                      Referrer Address (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <UserPlus className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={referrerAddress}
                        onChange={(e) => setReferrerAddress(e.target.value)}
                        placeholder="0x... (if referred by someone)"
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Enter referrer's wallet address to give them bonus staking days
                    </p>
                  </div>

                  {/* Selected Rank */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Selected Plan</label>
                    <div className={`bg-slate-900/50 border rounded-xl p-4 transition-all ${
                      selectedRank ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700/50'
                    }`}>
                      {selectedRank ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-blue-400" />
                            <span className="text-white font-semibold">{selectedRank}</span>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Award className="w-5 h-5" />
                          <span className="text-sm">No plan selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/30">
                    <h4 className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Your Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total Staked</span>
                        <span className="text-white font-semibold">0 USDT</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Daily Rewards</span>
                        <span className="text-emerald-400 font-semibold">0 1DREAM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total Earned</span>
                        <span className="text-amber-400 font-semibold">0 1DREAM</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                        <span className="text-sm text-gray-400">Referrals</span>
                        <span className="text-blue-400 font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stake Button */}
                  <button
                    onClick={handleStake}
                    disabled={!stakeAmount || !selectedRank}
                    className={`w-full px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 ${
                      !stakeAmount || !selectedRank
                        ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/50 transform hover:scale-[1.02]'
                    }`}
                  >
                    {!selectedRank ? 'Select a Plan' : !stakeAmount ? 'Enter Amount' : 'Stake Now'}
                  </button>

                  {selectedRank && stakeAmount && (
                    <p className="text-xs text-center text-gray-500 -mt-2">
                      Make sure you have approved the contract to spend your USDT
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
