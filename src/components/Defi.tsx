import React, { useState } from 'react';
import { Lock, Users, TrendingUp, Award, Gift, DollarSign, Calendar, Percent, UserPlus, Star, CheckCircle2, Sparkles, Copy, Link2, Check } from 'lucide-react';
import { useVaultStaking } from '../hooks/useVaultStaking';
import { ethers } from 'ethers';

interface DefiProps {
  isWalletConnected: boolean;
  walletAddress: string;
  onWalletConnect: () => void;
}

export default function Defi({ isWalletConnected, walletAddress, onWalletConnect }: DefiProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [referrerAddress, setReferrerAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [showingRewards, setShowingRewards] = useState(false);
  const [calculatedRewards, setCalculatedRewards] = useState<string>('0');
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [claimingRewards, setClaimingRewards] = useState(false);
  const [remainingDays, setRemainingDays] = useState<number>(0);

  // Initialize provider and signer
  React.useEffect(() => {
    const initProvider = async () => {
      if (isWalletConnected && window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const browserSigner = await browserProvider.getSigner();
        setProvider(browserProvider);
        setSigner(browserSigner);
      } else {
        setProvider(null);
        setSigner(null);
      }
    };

    initProvider();
  }, [isWalletConnected]);

  const {
    packages,
    userStake,
    contractStats,
    referralStats,
    pendingRewards,
    loading,
    error,
    stake: stakeToContract,
    claimRewards,
    calculateRewardsWithPrice,
    canClaim,
    canClaimRestakeBonus,
    getTimeRemaining,
    getBaseTimeRemaining,
    refresh
  } = useVaultStaking(walletAddress, signer || undefined);

  const hasActiveStake = userStake?.isActive || false;

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

  // Fetch remaining days when user has active stake
  React.useEffect(() => {
    const fetchRemainingDays = async () => {
      if (userStake?.isActive) {
        const remainingSeconds = await getTimeRemaining();
        const days = Math.ceil(remainingSeconds / (24 * 60 * 60));
        setRemainingDays(days);
      }
    };

    fetchRemainingDays();

    // Update every minute if stake is active
    const interval = userStake?.isActive ? setInterval(fetchRemainingDays, 60000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userStake, getTimeRemaining]);

  const stats = [
    { label: 'Total USDT Stake', value: contractStats ? `${parseFloat(contractStats.totalUsdtStaked).toLocaleString()} USDT` : '0', icon: DollarSign, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Stakers', value: contractStats ? contractStats.totalStakers.toString() : '0', icon: Users, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Daily Rewards', value: '1%', icon: TrendingUp, color: 'from-violet-500 to-violet-600' },
    { label: 'Rewards Paid', value: contractStats ? `${parseFloat(contractStats.totalRewardsPaid).toFixed(2)} 1Dream` : '0 1Dream', icon: Gift, color: 'from-amber-500 to-amber-600' }
  ];

  // Package styling map
  const packageStyles: Record<string, any> = {
    'Bronze': {
      tier: 'Starter',
      bgGradient: 'from-amber-900/40 via-amber-800/30 to-amber-900/40',
      borderGradient: 'from-amber-500 via-amber-400 to-amber-600',
      accentColor: 'amber',
      icon: '🥉'
    },
    'Silver': {
      tier: 'Growth',
      bgGradient: 'from-slate-700/40 via-slate-600/30 to-slate-700/40',
      borderGradient: 'from-slate-400 via-slate-300 to-slate-500',
      accentColor: 'slate',
      icon: '🥈'
    },
    'Gold': {
      tier: 'Premium',
      bgGradient: 'from-yellow-900/40 via-yellow-700/30 to-yellow-900/40',
      borderGradient: 'from-yellow-400 via-yellow-300 to-yellow-500',
      accentColor: 'yellow',
      icon: '🥇',
      popular: true
    },
    'Diamond': {
      tier: 'Elite',
      bgGradient: 'from-cyan-900/40 via-blue-800/30 to-cyan-900/40',
      borderGradient: 'from-cyan-400 via-blue-400 to-cyan-500',
      accentColor: 'cyan',
      icon: '💎'
    }
  };

  // Map packages from contract to display format
  const ranks = packages.map(pkg => {
    const style = packageStyles[pkg.name] || packageStyles['Bronze'];
    return {
      id: pkg.id,
      name: pkg.name,
      tier: style.tier,
      minStake: parseFloat(pkg.minAmount).toFixed(0),
      maxStake: parseFloat(pkg.maxAmount).toFixed(0),
      dailyRate: pkg.dailyRate,
      duration: pkg.baseDurationDays.toString(),
      referralBonus: pkg.referralBonusDays.toString(),
      restakingBonus: pkg.restakingBonusRate,
      bgGradient: style.bgGradient,
      borderGradient: style.borderGradient,
      accentColor: style.accentColor,
      icon: style.icon,
      popular: style.popular || false,
      features: [
        `Daily ${pkg.dailyRate} rewards`,
        `${pkg.baseDurationDays}-day base duration`,
        `+${pkg.referralBonusDays} days per referral`,
        `${pkg.restakingBonusRate} bonus after ${pkg.baseDurationDays} days`
      ]
    };
  });

  const handleSeeRewards = async () => {
    if (!isWalletConnected) {
      onWalletConnect();
      return;
    }

    setLoadingRewards(true);
    try {
      const rewards = await calculateRewardsWithPrice();
      setCalculatedRewards(rewards);
      setShowingRewards(true);
    } catch (error) {
      console.error('Error calculating rewards:', error);
      alert('Failed to calculate rewards. Please try again.');
    } finally {
      setLoadingRewards(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!isWalletConnected) {
      onWalletConnect();
      return;
    }

    if (!canClaim()) {
      alert('You can only claim rewards once every 24 hours.');
      return;
    }

    setClaimingRewards(true);
    try {
      await claimRewards();
      alert('Rewards claimed successfully!');
      setShowingRewards(false);
      setCalculatedRewards('0');
      await refresh();
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      alert(error.message || 'Failed to claim rewards. Please try again.');
    } finally {
      setClaimingRewards(false);
    }
  };

  const handleStake = async () => {
    if (!isWalletConnected) {
      onWalletConnect();
      return;
    }

    if (!selectedRank || !stakeAmount) {
      return;
    }

    try {
      const referrer = referrerAddress || ethers.ZeroAddress;
      await stakeToContract(selectedRank, stakeAmount, referrer);
      alert('Stake successful!');
      setStakeAmount('');
      setSelectedRank(null);
      await refresh();
    } catch (err: any) {
      console.error('Stake error:', err);
      alert(`Failed to stake: ${err.message}`);
    }
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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading packages...</p>
              </div>
            ) : ranks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No staking packages available</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {ranks.map((rank, index) => (
                  <div
                    key={rank.id}
                    onClick={() => setSelectedRank(rank.id)}
                    className={`relative group cursor-pointer transition-all duration-500 ${
                      selectedRank === rank.id ? 'scale-[1.02]' : 'hover:scale-[1.02]'
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
                      selectedRank === rank.id ? 'opacity-100' : ''
                    }`}></div>

                    {/* Card Content */}
                    <div className={`relative bg-gradient-to-br ${rank.bgGradient} backdrop-blur-xl rounded-2xl p-6 border-2 ${
                      selectedRank === rank.id
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
                          {selectedRank === rank.id && (
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
                        <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-lg p-3 mb-3 border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <UserPlus className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-blue-300 font-medium">Referral Bonus</span>
                          </div>
                          <p className="text-white text-sm">+{rank.referralBonus} days per referral</p>
                        </div>

                        {/* Re-staking Bonus */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 mb-4 border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Gift className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-purple-300 font-medium">Re-staking Bonus</span>
                          </div>
                          <p className="text-white text-sm">{rank.restakingBonus} of stake amount</p>
                          <p className="text-purple-300 text-xs mt-1">Claimable after {rank.duration} days</p>
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
                        {selectedRank === rank.id ? (
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
            )}
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
                            <span className="text-white font-semibold">{ranks.find(r => r.id === selectedRank)?.name}</span>
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
                        <span className="text-white font-semibold">{userStake ? `${parseFloat(userStake.usdtAmount).toFixed(2)} USDT` : '0 USDT'}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Pending Rewards</span>
                          {showingRewards ? (
                            <span className="text-emerald-400 font-semibold">{calculatedRewards} 1DREAM</span>
                          ) : (
                            <span className="text-gray-500 font-semibold text-xs">Click to view</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSeeRewards}
                            disabled={loadingRewards || !userStake}
                            className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                              loadingRewards
                                ? 'bg-blue-500/30 text-blue-300 cursor-wait'
                                : !userStake
                                ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400'
                            }`}
                          >
                            {loadingRewards ? (
                              <span className="flex items-center justify-center gap-1">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                              </span>
                            ) : (
                              'See Rewards'
                            )}
                          </button>
                          {showingRewards && (
                            <button
                              onClick={handleClaimRewards}
                              disabled={claimingRewards || !canClaim()}
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                                claimingRewards
                                  ? 'bg-emerald-500/30 text-emerald-300 cursor-wait'
                                  : !canClaim()
                                  ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400'
                              }`}
                              title={!canClaim() ? 'You can claim rewards once every 24 hours' : 'Claim your rewards'}
                            >
                              {claimingRewards ? (
                                <span className="flex items-center justify-center gap-1">
                                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Claiming...
                                </span>
                              ) : (
                                'Claim'
                              )}
                            </button>
                          )}
                        </div>
                        {showingRewards && !canClaim() && (
                          <p className="text-xs text-amber-400/80 mt-1">
                            You can claim rewards every 24 hours
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Rank/Package</span>
                        <span className="text-blue-400 font-semibold">{userStake ? userStake.packageName : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Duration</span>
                        <span className="text-purple-400 font-semibold">
                          {userStake ? (
                            <span>
                              {remainingDays > 0 ? `${remainingDays} days remaining` : 'Completed'}
                              {userStake.referralCount > 0 && remainingDays > 0 && (
                                <span className="text-green-400 text-xs ml-1">
                                  (+{userStake.referralCount} referrals)
                                </span>
                              )}
                            </span>
                          ) : 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Re-staking Bonus</span>
                          <span className="text-amber-400 font-semibold">{userStake ? `${parseFloat(userStake.restakeBonus).toFixed(4)} 1DREAM` : '0 1DREAM'}</span>
                        </div>
                        {userStake && !userStake.restakeBonusClaimed && (
                          <p className="text-xs text-gray-500">
                            {userStake.restakeBonusPercent}% Bonus on Re-stake
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                        <span className="text-sm text-gray-400">Referrals</span>
                        <span className="text-blue-400 font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {referralStats?.totalReferralCount || 0}
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
