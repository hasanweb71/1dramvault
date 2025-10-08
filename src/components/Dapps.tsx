import React from 'react';
import { Wallet, Shield, TrendingUp, Clock, Users, Gift, Copy, Check, ExternalLink, AlertCircle, CheckCircle, RefreshCw, Zap, Lock, Star, ArrowRight, Target, Download } from 'lucide-react';
import { useStakingData } from '../hooks/useStakingData';
import { useReferralData } from '../hooks/useReferralData';

interface DappsProps {
  isWalletConnected: boolean;
  walletAddress: string;
  setActiveView: (view: 'home' | 'trade' | 'dapps' | 'roadmap' | 'defi' | 'stakingHistory') => void;
  onWalletConnect: () => void;
}

export default function Dapps({ isWalletConnected, walletAddress, setActiveView, onWalletConnect }: DappsProps) {
  // State for staking form
  const [selectedPlan, setSelectedPlan] = React.useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = React.useState<string>('');
  const [referrerAddress, setReferrerAddress] = React.useState<string>('');
  const [isApproving, setIsApproving] = React.useState(false);
  const [isStaking, setIsStaking] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);
  const [isUnstaking, setIsUnstaking] = React.useState(false);
  const [isClaimingReferral, setIsClaimingReferral] = React.useState(false);
  const [transactionError, setTransactionError] = React.useState('');
  const [transactionSuccess, setTransactionSuccess] = React.useState('');
  const [userBalance, setUserBalance] = React.useState('0');
  const [allowance, setAllowance] = React.useState('0');
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Hooks
  const {
    stakingPlans,
    stakingStats,
    userStakingData,
    loading,
    error,
    refresh,
    refreshUserData,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    approveTokens,
    checkAllowance,
    fetchUserOneDreamBalance,
    claimReferralBonus,
    claimAllReferralBonuses
  } = useStakingData();

  const {
    referralCommission,
    userReferralData,
    referredStakes,
    claimableAmount,
    loadingReferredStakes,
    loadingClaimable,
    refreshReferralData,
    fetchClaimableOnly
  } = useReferralData();

  // Fetch user data when wallet connects
  React.useEffect(() => {
    if (isWalletConnected && walletAddress) {
      const fetchUserData = async () => {
        try {
          const [balance, currentAllowance] = await Promise.all([
            fetchUserOneDreamBalance(walletAddress),
            checkAllowance(walletAddress)
          ]);
          setUserBalance(balance);
          setAllowance(currentAllowance);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [isWalletConnected, walletAddress, fetchUserOneDreamBalance, checkAllowance]);

  // Refresh user data when wallet connects
  React.useEffect(() => {
    if (isWalletConnected && walletAddress) {
      console.log('Fetching user staking data for:', walletAddress);
      refreshUserData(walletAddress);
      refreshReferralData(walletAddress);
    } else {
      console.log('Wallet not connected or no address');
    }
  }, [isWalletConnected, walletAddress, refreshUserData, refreshReferralData]);

  // Auto-fill referrer address from user's first stake
  React.useEffect(() => {
    if (userStakingData && userStakingData.stakes && userStakingData.stakes.length > 0) {
      const firstStake = userStakingData.stakes[0];
      if (firstStake.referrer && firstStake.referrer !== '0x0000000000000000000000000000000000000000') {
        // Only auto-fill if user hasn't manually entered a referrer
        if (!referrerAddress) {
          setReferrerAddress(firstStake.referrer);
          console.log('[AUTO-FILL] Using existing referrer:', firstStake.referrer);
        }
      }
    }
  }, [userStakingData]);

  // Generate referral link
  const generateReferralLink = () => {
    if (!isWalletConnected) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${walletAddress}`;
  };

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    const link = generateReferralLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle token approval
  const handleApprove = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setTransactionError('Please enter a valid amount');
      return;
    }

    setIsApproving(true);
    setTransactionError('');
    setTransactionSuccess('');

    try {
      const success = await approveTokens(stakeAmount);
      if (success) {
        setTransactionSuccess('Tokens approved successfully!');
        // Refresh allowance
        const newAllowance = await checkAllowance(walletAddress);
        setAllowance(newAllowance);
      } else {
        setTransactionError('Failed to approve tokens');
      }
    } catch (error) {
      setTransactionError('Approval transaction failed');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle staking
  const handleStake = async () => {
    if (!selectedPlan) {
      setTransactionError('Please select a staking plan');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setTransactionError('Please enter a valid amount');
      return;
    }

    const selectedPlanData = stakingPlans.find(plan => plan.id === selectedPlan);
    if (!selectedPlanData) {
      setTransactionError('Invalid staking plan selected');
      return;
    }

    const minStake = parseFloat(selectedPlanData.minStake.replace(/[^\d.]/g, ''));
    if (parseFloat(stakeAmount) < minStake) {
      setTransactionError(`Minimum stake amount is ${minStake} 1DREAM`);
      return;
    }

    setIsStaking(true);
    setTransactionError('');
    setTransactionSuccess('');

    try {
      // Use existing referrer if user has previous stakes, otherwise use the entered one
      let finalReferrer = referrerAddress || undefined;

      // If user has existing stakes, use their first referrer to maintain consistency
      if (userStakingData && userStakingData.stakes && userStakingData.stakes.length > 0) {
        const firstStake = userStakingData.stakes[0];
        if (firstStake.referrer && firstStake.referrer !== '0x0000000000000000000000000000000000000000') {
          finalReferrer = firstStake.referrer;
          console.log('[STAKE] Using existing referrer from first stake:', finalReferrer);
        }
      }

      const success = await stakeTokens(selectedPlan, stakeAmount, finalReferrer);
      if (success) {
        setTransactionSuccess('Tokens staked successfully!');
        setStakeAmount('');
        setSelectedPlan(null);
        setReferrerAddress('');
        
        // Refresh user data
        refreshUserData(walletAddress);
        refreshReferralData(walletAddress);
        
        // Refresh balances
        const [newBalance, newAllowance] = await Promise.all([
          fetchUserOneDreamBalance(walletAddress),
          checkAllowance(walletAddress)
        ]);
        setUserBalance(newBalance);
        setAllowance(newAllowance);
      } else {
        setTransactionError('Failed to stake tokens');
      }
    } catch (error) {
      setTransactionError('Staking transaction failed');
    } finally {
      setIsStaking(false);
    }
  };

  // Handle unstaking
  const handleUnstake = async (stakeIndex: number) => {
    setIsUnstaking(true);
    setTransactionError('');
    setTransactionSuccess('');

    try {
      const success = await unstakeTokens(stakeIndex);
      if (success) {
        setTransactionSuccess('Tokens unstaked successfully!');
        refreshUserData(walletAddress);
        
        // Refresh balance
        const newBalance = await fetchUserOneDreamBalance(walletAddress);
        setUserBalance(newBalance);
      } else {
        setTransactionError('Failed to unstake tokens');
      }
    } catch (error) {
      setTransactionError('Unstaking transaction failed');
    } finally {
      setIsUnstaking(false);
    }
  };

  // Handle claiming all referral bonuses
  const handleClaimAllReferralBonuses = async () => {
    if (!walletAddress) return;

    setIsClaimingReferral(true);
    setTransactionError('');
    setTransactionSuccess('');

    try {
      const success = await claimAllReferralBonuses(walletAddress);
      if (success) {
        setTransactionSuccess('All referral bonuses claimed successfully!');

        // Refresh data
        refreshUserData(walletAddress);
        refreshReferralData(walletAddress);

        // Refresh balance
        const newBalance = await fetchUserOneDreamBalance(walletAddress);
        setUserBalance(newBalance);
      } else {
        setTransactionError('Failed to claim referral bonuses');
      }
    } catch (error) {
      console.error('Error claiming referral bonuses:', error);
      setTransactionError('Claim transaction failed');
    } finally {
      setIsClaimingReferral(false);
    }
  };

  // Handle reward claiming
  const handleClaimRewards = async (stakeIndex: number) => {
    setIsClaiming(true);
    setTransactionError('');
    setTransactionSuccess('');

    try {
      const success = await claimRewards(stakeIndex);
      if (success) {
        setTransactionSuccess('Rewards claimed successfully!');
        refreshUserData(walletAddress);
        
        // Refresh balance
        const newBalance = await fetchUserOneDreamBalance(walletAddress);
        setUserBalance(newBalance);
      } else {
        setTransactionError('Failed to claim rewards');
      }
    } catch (error) {
      setTransactionError('Reward claim failed');
    } finally {
      setIsClaiming(false);
    }
  };

  // Handle referral bonus claiming
  const handleClaimReferralBonus = async (stakerAddress: string, stakeIndex: number) => {
    setTransactionError('');
    setTransactionSuccess('');

    try {
      const success = await claimReferralBonus(stakerAddress, stakeIndex);
      if (success) {
        setTransactionSuccess('Referral bonus claimed successfully!');
        refreshUserData(walletAddress);
        refreshReferralData(walletAddress);
        
        // Refresh balance
        const newBalance = await fetchUserOneDreamBalance(walletAddress);
        setUserBalance(newBalance);
      } else {
        setTransactionError('Failed to claim referral bonus');
      }
    } catch (error) {
      setTransactionError('Referral bonus claim failed');
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format time remaining for locked stakes
  const formatTimeRemaining = (lockEndTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = lockEndTime - now;
    
    if (remaining <= 0) return 'Unlocked';
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  // Check if user has sufficient allowance
  const hasInsufficientAllowance = () => {
    if (!stakeAmount || !allowance) return false;
    return parseFloat(allowance) < parseFloat(stakeAmount);
  };

  // Check if user has sufficient balance
  const hasInsufficientBalance = () => {
    if (!stakeAmount || !userBalance) return false;
    return parseFloat(userBalance) < parseFloat(stakeAmount);
  };

  // Calculate estimated rewards
  const calculateEstimatedRewards = () => {
    if (!selectedPlan || !stakeAmount) return { daily: '0.00', monthly: '0.00' };
    
    const selectedPlanData = stakingPlans.find(plan => plan.id === selectedPlan);
    if (!selectedPlanData) return { daily: '0.00', monthly: '0.00' };
    
    const amount = parseFloat(stakeAmount);
    const apyPercent = selectedPlanData.apyBasisPoints / 100; // Convert basis points to percentage
    
    const dailyReward = (amount * apyPercent) / 365 / 100;
    const monthlyReward = dailyReward * 30;
    
    return {
      daily: dailyReward.toFixed(4),
      monthly: monthlyReward.toFixed(2)
    };
  };

  const estimatedRewards = calculateEstimatedRewards();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">1DREAM Dapps</h1>
          <p className="text-xl text-slate-400">Make your 1Dream reality through staking and referrals</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {loading ? '...' : stakingStats.totalStaked}
            </div>
            <div className="text-sm text-slate-400">Total Staked</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {loading ? '...' : stakingStats.totalStakers}
            </div>
            <div className="text-sm text-slate-400">Total Stakers</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{(referralCommission / 100).toFixed(1)}%</div>
            <div className="text-sm text-slate-400">Referral Rate</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {loading ? '...' : stakingStats.contractBalance}
            </div>
            <div className="text-sm text-slate-400">Reward Pool</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Staking Plans and Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Error/Success Messages */}
            {transactionError && (
              <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400">{transactionError}</p>
              </div>
            )}

            {transactionSuccess && (
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-xl flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400">{transactionSuccess}</p>
              </div>
            )}

            {/* Staking Plans */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Staking Plans</h2>
                {!loading && stakingPlans.length > 0 && (
                  <span className="text-sm text-slate-400">
                    {stakingPlans.length} plan{stakingPlans.length !== 1 ? 's' : ''} available
                  </span>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-400">Loading staking plans...</p>
                  <p className="text-xs text-slate-500 mt-2">This may take a moment</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={refresh}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : stakingPlans.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No staking plans available</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {stakingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border transition-all duration-300 cursor-pointer ${
                        selectedPlan === plan.id
                          ? 'border-blue-500/50 bg-blue-900/20'
                          : 'border-slate-700/50 hover:border-blue-500/30'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-green-400 mb-1">{plan.apy}</div>
                        <div className="text-sm text-slate-400">APY</div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Lock Period</span>
                          <span className="text-white">{plan.lockPeriod}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Min Stake</span>
                          <span className="text-white">{plan.minStake} 1DREAM</span>
                        </div>
                        {plan.earlyUnstakeFee !== '0%' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Early Fee</span>
                            <span className="text-orange-400">{plan.earlyUnstakeFee}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {selectedPlan === plan.id && (
                        <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                          <p className="text-blue-400 text-sm font-medium">✓ Plan Selected</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stake Your Tokens Form */}
            {isWalletConnected && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Stake Your Tokens</h2>
                
                <div className="space-y-6">
                  {/* Wallet Status */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Wallet Connected</span>
                      <span className="text-green-400 font-medium">{formatAddress(walletAddress)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Balance</span>
                      <span className="text-white font-bold">{parseFloat(userBalance).toFixed(2)} 1DREAM</span>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Amount to Stake
                    </label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="100"
                      disabled={isApproving || isStaking}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 disabled:opacity-50"
                    />
                    {selectedPlan && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Minimum:</span>
                          <span className="text-white">{stakingPlans.find(p => p.id === selectedPlan)?.minStake} 1DREAM</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Estimated Daily Rewards:</span>
                          <span className="text-green-400">{estimatedRewards.daily} 1DREAM</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Estimated Monthly Rewards:</span>
                          <span className="text-green-400">{estimatedRewards.monthly} 1DREAM</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Referrer Address Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Referrer Address {userStakingData && userStakingData.stakes && userStakingData.stakes.length > 0 ? '(Locked)' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      value={referrerAddress}
                      onChange={(e) => setReferrerAddress(e.target.value)}
                      placeholder="Enter referrer wallet address"
                      disabled={isApproving || isStaking || (userStakingData && userStakingData.stakes && userStakingData.stakes.length > 0)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 disabled:opacity-50"
                    />
                    {userStakingData && userStakingData.stakes && userStakingData.stakes.length > 0 && referrerAddress && (
                      <p className="text-xs text-slate-400 mt-1">
                        Your referrer is locked to maintain consistency across all stakes
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    {hasInsufficientAllowance() ? (
                      <button
                        onClick={handleApprove}
                        disabled={isApproving || !stakeAmount || parseFloat(stakeAmount) <= 0 || hasInsufficientBalance()}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isApproving ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5" />
                            <span>Approve Tokens</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleStake}
                        disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0 || hasInsufficientBalance() || !selectedPlan}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isStaking ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Staking...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            <span>Stake Tokens</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Your Stakes and Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Your Stakes */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Your Stakes</h3>

              {!isWalletConnected ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">Connect wallet to view your stakes</p>
                  <button
                    onClick={onWalletConnect}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : loading && !userStakingData ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-400 text-sm">Loading your stakes...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 text-sm mb-2">Failed to load stakes</p>
                  <button
                    onClick={() => refreshUserData(walletAddress)}
                    className="text-blue-400 text-sm hover:text-blue-300"
                  >
                    Try Again
                  </button>
                </div>
              ) : userStakingData && userStakingData.stakes && userStakingData.stakes.length > 0 ? (
                <>
                  {/* Debug info - remove later */}
                  <div className="text-xs text-slate-500 mb-2">
                    Found {userStakingData.stakes.length} stake(s)
                  </div>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {userStakingData.stakes.map((stake, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-medium">{stake.planName}</h4>
                          <p className="text-slate-400 text-sm">{stake.amount} 1DREAM</p>
                          {stake.isLocked && (
                            <p className="text-orange-400 text-xs">
                              Locked: {formatTimeRemaining(stake.lockEndTime)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">{stake.pendingRewards}</p>
                          <p className="text-slate-400 text-sm">Rewards</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleClaimRewards(index)}
                          disabled={isClaiming || parseFloat(stake.pendingRewards) <= 0}
                          className="flex-1 bg-green-600/20 text-green-400 py-2 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50 text-sm"
                        >
                          Claim
                        </button>
                        
                        <button
                          onClick={() => handleUnstake(index)}
                          disabled={isUnstaking}
                          className="flex-1 bg-red-600/20 text-red-400 py-2 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50 text-sm"
                        >
                          Unstake
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
              ) : userStakingData ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No active stakes</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Stake data loaded but no stakes found
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No active stakes</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="w-full bg-slate-700/50 text-slate-300 py-3 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
                
                <button
                  onClick={() => setActiveView('stakingHistory')}
                  className="w-full bg-blue-600/20 text-blue-400 py-3 rounded-xl hover:bg-blue-600/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>View History</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Program Section */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-8">Referral Program</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Your Referral Stats */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Your Referral Stats</h3>
              
              <div className="bg-slate-700/30 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {isWalletConnected && userStakingData ? userStakingData.userDirectReferralCount : '0'}
                    </div>
                    <div className="text-sm text-slate-400">Your Referrals</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="text-3xl font-bold text-green-400">
                        {loadingClaimable ? (
                          <div className="text-blue-400 animate-pulse">Loading...</div>
                        ) : (
                          claimableAmount
                        )}
                      </div>
                      {isWalletConnected && walletAddress && (
                        <button
                          onClick={() => fetchClaimableOnly(walletAddress)}
                          disabled={loadingClaimable}
                          className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors disabled:opacity-50"
                          title="Refresh claimable amount"
                        >
                          <RefreshCw className={`w-4 h-4 ${loadingClaimable ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mb-3">Claimable (1DREAM)</div>

                    {isWalletConnected && walletAddress && parseFloat(claimableAmount) > 0 && (
                      <button
                        onClick={handleClaimAllReferralBonuses}
                        disabled={isClaimingReferral}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                      >
                        {isClaimingReferral ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Claim Bonuses
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Referral Link</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generateReferralLink()}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg text-sm select-text"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Simplified Referral Commission */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Referral Commission</h3>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">Direct Referral</span>
                  <span className="text-3xl font-bold">{(referralCommission / 100).toFixed(1)}%</span>
                </div>
                <div className="text-sm opacity-90">
                  Earn {(referralCommission / 100).toFixed(1)}% commission on every referral's stake
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">How It Works</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Share your referral link</li>
                  <li>• Friends stake using your link</li>
                  <li>• You earn {(referralCommission / 100).toFixed(1)}% of their stake amount</li>
                  <li>• Claim bonuses anytime</li>
                </ul>
              </div>
              
              <p className="text-sm text-slate-400">
                Simple, transparent, and fair for everyone!
              </p>
            </div>
          </div>
        </div>

        {/* Referral Bonuses for Claims */}
        {isWalletConnected && referredStakes && referredStakes.length > 0 && (
          <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Referral Bonuses</h2>
            
            {loadingReferredStakes ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-400">Loading referred stakes...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {referredStakes.map((stake, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-medium">{stake.planName}</p>
                        <p className="text-slate-400 text-sm">{formatAddress(stake.stakerAddress)}</p>
                        <p className="text-slate-400 text-sm">{stake.amount} 1DREAM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{stake.potentialBonus}</p>
                        <p className="text-slate-400 text-sm">Bonus</p>
                      </div>
                    </div>
                    
                    {!stake.bonusClaimed ? (
                      <button
                        onClick={() => handleClaimReferralBonus(stake.stakerAddress, stake.stakeIndex)}
                        className="w-full bg-green-600/20 text-green-400 py-2 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                      >
                        Claim Bonus
                      </button>
                    ) : (
                      <div className="w-full bg-gray-600/20 text-gray-400 py-2 rounded-lg text-center text-sm">
                        Already Claimed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}