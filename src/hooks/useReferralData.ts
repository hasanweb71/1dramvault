import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { retryWithBackoff, createFallbackProvider } from '../utils/ethersUtils';

// V3 Contract Address - Updated with improved referral tracking
const STAKING_CONTRACT_ADDRESS = '0xded53d0b2dd7be3c30243e97b65b8a6647c61108';

// V3 Contract deployment block (BSC Mainnet)
// Contract was deployed at block 43436756 (approximately)
const V3_DEPLOYMENT_BLOCK = 43436500; // Start slightly before actual deployment

// Import V3 ABI with stakeIndex in events for better referral tracking
import STAKING_CONTRACT_ABI_JSON from '../../contracts/OneDreamStakingV3_ABI.json';
const STAKING_CONTRACT_ABI = STAKING_CONTRACT_ABI_JSON;

// Interfaces for referral data
export interface ReferredStake {
  stakerAddress: string;
  stakeIndex: number;
  planId: number;
  planName: string;
  amount: string;
  amountWei: string;
  startTime: number;
  potentialBonus: string;
  potentialBonusWei: string;
  bonusClaimed: boolean;
  transactionHash: string;
  commissionAtStake: number;
}

export interface UserReferralData {
  directReferralCount: number;
  totalReferralEarnings: string;
  claimableAmount: string; // NEW: Direct from contract
  claimableAmountWei: string; // NEW: Wei value
  referredStakes: ReferredStake[];
  lastUpdated: string;
}

// Cache configuration - reduced for referral data to ensure freshness
const CACHE_DURATION = 30 * 1000; // 30 seconds for fresh data

// Helper function to create provider
const createProvider = () => {
  return createFallbackProvider();
};

// CRITICAL: Direct fetch for claimable amount - bypasses all caching
export const fetchClaimableAmountDirect = async (referrerAddress: string): Promise<{ amount: string; amountWei: string } | null> => {
  if (!referrerAddress) return null;

  try {
    console.log('[CLAIMABLE] Fetching claimable amount for:', referrerAddress);
    const provider = createProvider();
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

    // V3 returns arrays: [stakers[], stakeIndexes[], bonusAmounts[]]
    const result = await retryWithBackoff(() =>
      stakingContract.getClaimableReferralBonuses(referrerAddress), 3, 1000
    );

    console.log('[CLAIMABLE] Raw result:', result);

    // Destructure the three arrays
    const [stakers, stakeIndexes, bonusAmounts] = result;

    console.log('[CLAIMABLE] Stakers:', stakers);
    console.log('[CLAIMABLE] StakeIndexes:', stakeIndexes);
    console.log('[CLAIMABLE] BonusAmounts:', bonusAmounts);

    // Sum all bonus amounts
    let totalClaimable = BigInt(0);
    if (bonusAmounts && bonusAmounts.length > 0) {
      for (const bonus of bonusAmounts) {
        totalClaimable += BigInt(bonus.toString());
      }
    }

    const claimableStr = totalClaimable.toString();
    const claimableFormatted = formatTokenAmount(claimableStr);

    console.log('[CLAIMABLE] Total Wei:', claimableStr);
    console.log('[CLAIMABLE] Formatted:', claimableFormatted);

    return {
      amount: claimableFormatted,
      amountWei: claimableStr
    };
  } catch (error) {
    console.error('[CLAIMABLE] Error fetching claimable amount:', error);
    return null;
  }
};

// Helper function to format token amounts
const formatTokenAmount = (amountWei: string, decimals: number = 18): string => {
  try {
    const formatted = ethers.formatUnits(amountWei, decimals);
    const num = parseFloat(formatted);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
  } catch {
    return '0';
  }
};

// Cache management functions
const getCacheKey = (type: string, address?: string) => {
  if (address) {
    return `onedream_${type}_${address.toLowerCase()}`;
  }
  return `onedream_${type}`;
};

const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Error reading from cache:', error);
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.warn('Error writing to cache:', error);
  }
};

// Fetch referred stakes directly from blockchain events
const fetchReferredStakesFromBlockchain = async (referrerAddress: string): Promise<ReferredStake[]> => {
  const cacheKey = getCacheKey('referred_stakes', referrerAddress);
  const cached = getCachedData(cacheKey);

  if (cached) {
    console.log('Using cached referred stakes data');
    return cached;
  }

  try {
    console.log('Fetching referred stakes from blockchain for:', referrerAddress);
    const provider = createProvider();
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

    // Get current block number to determine safe query range
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = V3_DEPLOYMENT_BLOCK; // Start from V3 deployment block
    const CHUNK_SIZE = 10000; // Process events in chunks of 10,000 blocks

    console.log(`Querying V3 events from block ${fromBlock} to ${currentBlock} (${currentBlock - fromBlock} blocks)`);

    // Query events in chunks to avoid rate limiting
    const allStakedEvents = [];
    const allClaimedEvents = [];

    for (let i = fromBlock; i <= currentBlock; i += CHUNK_SIZE) {
      const chunkFromBlock = i;
      const chunkToBlock = Math.min(i + CHUNK_SIZE - 1, currentBlock);
      console.log(`Fetching events in chunk: ${chunkFromBlock} to ${chunkToBlock}`);

      try {
        // V3 Staked event: user (indexed), stakeIndex (indexed), planId, amount, startTime, referrer (indexed)
        // Filter by referrer address (last parameter)
        const stakedEventsFilter = stakingContract.filters.Staked(null, null, referrerAddress);
        const claimedEventsFilter = stakingContract.filters.ReferralBonusClaimed(referrerAddress);

        const [stakedChunk, claimedChunk] = await Promise.all([
          retryWithBackoff(() => stakingContract.queryFilter(stakedEventsFilter, chunkFromBlock, chunkToBlock), 7, 5000), // Increased delay for event queries
          retryWithBackoff(() => stakingContract.queryFilter(claimedEventsFilter, chunkFromBlock, chunkToBlock), 7, 5000)  // Increased delay for event queries
        ]);

        allStakedEvents.push(...stakedChunk);
        allClaimedEvents.push(...claimedChunk);

        // Add delay between chunks to be respectful to RPC providers
        if (i + CHUNK_SIZE <= currentBlock) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between chunks
        }
      } catch (chunkError) {
        console.warn(`Failed to fetch events for chunk ${chunkFromBlock}-${chunkToBlock}:`, chunkError);
        // Continue with next chunk even if this one fails
      }
    }

    console.log(`Found ${allStakedEvents.length} Staked events for referrer ${referrerAddress}`);
    console.log(`Found ${allClaimedEvents.length} ReferralBonusClaimed events for referrer ${referrerAddress}`);

    if (allStakedEvents.length === 0) {
      setCachedData(cacheKey, []);
      return [];
    }

    // Sort events by block number and transaction index to ensure correct ordering
    allStakedEvents.sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) {
        return a.blockNumber - b.blockNumber;
      }
      return (a.transactionIndex || 0) - (b.transactionIndex || 0);
    });

    const referredStakesMap = new Map<string, ReferredStake>();

    // Process Staked events (V3 now includes stakeIndex directly)
    for (const event of allStakedEvents) {
      try {
        const { user, stakeIndex, planId, amount, startTime, referrer } = event.args;
        const transactionHash = event.transactionHash;
        const blockNumber = event.blockNumber;

        // V3 improvement: stakeIndex is now directly available from the event
        const userKey = user.toLowerCase();
        const stakeIndexNum = Number(stakeIndex);

        // Fetch plan details and commission at the time of the event
        const [planDetails, commissionBasisPoints] = await Promise.all([
          retryWithBackoff(() => stakingContract.getStakingPlan(planId, { blockTag: blockNumber })),
          retryWithBackoff(() => stakingContract.referralCommissionBasisPoints({ blockTag: blockNumber }))
        ]);

        const planName = planDetails.name;
        const potentialBonusWei = (BigInt(amount) * BigInt(commissionBasisPoints)) / BigInt(10000);

        const uniqueKey = `${userKey}-${stakeIndexNum}`;
        referredStakesMap.set(uniqueKey, {
          stakerAddress: userKey,
          stakeIndex: stakeIndexNum,
          planId: Number(planId),
          planName: planName,
          amount: formatTokenAmount(amount.toString()),
          amountWei: amount.toString(),
          startTime: Number(startTime),
          potentialBonus: formatTokenAmount(potentialBonusWei.toString()),
          potentialBonusWei: potentialBonusWei.toString(),
          bonusClaimed: false, // Will be updated by checking contract state
          transactionHash: transactionHash,
          commissionAtStake: Number(commissionBasisPoints)
        });
      } catch (eventError) {
        console.warn('Error processing Staked event:', eventError);
      }
    }

    // Fetch actual stake data from contract to check if bonuses have been claimed
    const referredStakesList = Array.from(referredStakesMap.values());

    console.log(`Fetching claim status for ${referredStakesList.length} referred stakes...`);
    for (const referredStake of referredStakesList) {
      try {
        // Fetch the actual stake from the contract
        const stakes = await retryWithBackoff(() =>
          stakingContract.getAllUserStakes(referredStake.stakerAddress), 2, 500
        );

        if (stakes && stakes.length > referredStake.stakeIndex) {
          const contractStake = stakes[referredStake.stakeIndex];
          // Check if referralBonusClaimed is greater than 0
          referredStake.bonusClaimed = BigInt(contractStake.referralBonusClaimed) > BigInt(0);
        }
      } catch (stakeCheckError) {
        console.warn(`Failed to check claim status for stake ${referredStake.stakeIndex}:`, stakeCheckError);
        // If we can't check, assume it's not claimed
        referredStake.bonusClaimed = false;
      }
    }

    referredStakesList.sort((a, b) => b.startTime - a.startTime); // Sort by most recent

    setCachedData(cacheKey, referredStakesList);
    return referredStakesList;

  } catch (err) {
    console.error('Error fetching referred stakes from blockchain:', err);
    return [];
  }
};

// Fallback function to fetch staking plans without multicall
const fetchStakingPlansDirectly = async (provider: ethers.JsonRpcProvider, stakingContract: ethers.Contract) => {
  try {
    // Get plan count first
    const planCount = await retryWithBackoff(() => stakingContract.getStakingPlanCount(), 5, 2000);
    const plans = [];

    // Fetch each plan individually
    for (let i = 1; i <= planCount; i++) {
      try {
        const plan = await retryWithBackoff(() => stakingContract.getStakingPlan(i), 5, 2000);
        if (plan.active) {
          plans.push(plan);
        }
      } catch (planError) {
        console.warn(`Failed to fetch plan ${i}:`, planError);
      }
    }

    return plans;
  } catch (error) {
    console.error('Failed to fetch staking plans directly:', error);
    return [];
  }
};

// Add delay between different types of contract calls
const addCallDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const useReferralData = () => {
  const [referralCommission, setReferralCommission] = useState<number>(1000); // V3 Default 10%
  const [userReferralData, setUserReferralData] = useState<UserReferralData | null>(null);
  const [referredStakes, setReferredStakes] = useState<ReferredStake[]>([]);
  const [claimableAmount, setClaimableAmount] = useState<string>('0.00'); // NEW: Direct state for claimable
  const [loading, setLoading] = useState(false);
  const [loadingReferredStakes, setLoadingReferredStakes] = useState(false);
  const [loadingClaimable, setLoadingClaimable] = useState(false); // NEW: Loading state for claimable
  const [error, setError] = useState<string | null>(null);

  // Fetch current referral commission from contract (simplified - single value)
  const fetchReferralCommission = async (): Promise<number> => {
    const cacheKey = getCacheKey('referral_commission');
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const provider = createProvider();
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);
      
      const commission = await retryWithBackoff(() => stakingContract.referralCommissionBasisPoints());
      const commissionNumber = Number(commission);
      
      setCachedData(cacheKey, commissionNumber);
      return commissionNumber;
    } catch (err) {
      console.error('Error fetching referral commission:', err);
      return 1000; // V3 Default 10%
    }
  };

  // Fetch user referral data from contract
  const fetchUserReferralData = useCallback(async (walletAddress: string): Promise<UserReferralData | null> => {
    if (!walletAddress) return null;

    console.log('Fetching user referral data for:', walletAddress);
    const cacheKey = getCacheKey('user_referral_data', walletAddress);
    const cached = getCachedData(cacheKey);

    if (cached) {
      setUserReferralData(cached);
      setReferredStakes(cached.referredStakes);
      return cached;
    }

    try {
      const provider = createProvider();
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

      const [directReferralCount, totalReferralEarnings, claimableReferralBonusesResult] = await Promise.all([
        retryWithBackoff(() => stakingContract.getDirectReferralCount(walletAddress)),
        retryWithBackoff(() => stakingContract.getReferrerTotalEarnings(walletAddress)),
        retryWithBackoff(() => stakingContract.getClaimableReferralBonuses(walletAddress))
      ]);

      console.log('Direct referral count from contract:', directReferralCount.toString());
      console.log('Total referral earnings from contract:', totalReferralEarnings.toString());
      console.log('Claimable referral bonuses result:', claimableReferralBonusesResult);

      // Parse claimable bonuses - V3 returns [stakers[], stakeIndexes[], bonusAmounts[]]
      const [, , bonusAmounts] = claimableReferralBonusesResult;
      let totalClaimableWei = BigInt(0);
      if (bonusAmounts && bonusAmounts.length > 0) {
        for (const bonus of bonusAmounts) {
          totalClaimableWei += BigInt(bonus.toString());
        }
      }

      // Fetch referred stakes directly from blockchain
      const referredStakesList = await fetchReferredStakesFromBlockchain(walletAddress);

      const userData: UserReferralData = {
        directReferralCount: Number(directReferralCount),
        totalReferralEarnings: formatTokenAmount(totalReferralEarnings.toString()),
        claimableAmount: formatTokenAmount(totalClaimableWei.toString()),
        claimableAmountWei: totalClaimableWei.toString(),
        referredStakes: referredStakesList,
        lastUpdated: new Date().toISOString()
      };

      setCachedData(cacheKey, userData);
      setReferredStakes(referredStakesList);
      
      return userData;

    } catch (err) {
      console.error('Error fetching user referral data:', err);
      return null;
    }
  }, []);

  // NEW: Dedicated function to fetch ONLY claimable amount (bypasses complex data flow)
  const fetchClaimableOnly = React.useCallback(async (walletAddress: string) => {
    if (!walletAddress) return;

    setLoadingClaimable(true);
    console.log('[REFERRAL] Fetching claimable amount only for:', walletAddress);

    try {
      const result = await fetchClaimableAmountDirect(walletAddress);
      if (result) {
        console.log('[REFERRAL] Successfully fetched claimable:', result.amount);
        setClaimableAmount(result.amount);
      } else {
        console.warn('[REFERRAL] Failed to fetch claimable amount');
        setClaimableAmount('0.00');
      }
    } catch (err) {
      console.error('[REFERRAL] Error in fetchClaimableOnly:', err);
      setClaimableAmount('0.00');
    } finally {
      setLoadingClaimable(false);
    }
  }, []);

  // Main refresh function
  const refreshReferralData = React.useCallback(async (walletAddress?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch referral commission (simplified - single value)
      const commission = await fetchReferralCommission();
      setReferralCommission(commission);

      // Fetch user data if wallet address provided
      if (walletAddress) {
        // CRITICAL: Fetch claimable amount directly first (most important data)
        await fetchClaimableOnly(walletAddress);

        // Then fetch other data
        setLoadingReferredStakes(true);
        const userData = await fetchUserReferralData(walletAddress);
        setUserReferralData(userData);
        setLoadingReferredStakes(false);
      }

    } catch (err) {
      console.error('Error refreshing referral data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch referral data');
      setLoadingReferredStakes(false);
    } finally {
      setLoading(false);
    }
  }, [fetchUserReferralData, fetchClaimableOnly]);

  // Initialize on mount
  useEffect(() => {
    refreshReferralData();
  }, []);

  return {
    referralCommission, // Single commission value instead of tiers array
    userReferralData,
    referredStakes,
    claimableAmount, // NEW: Direct claimable amount
    loading,
    loadingReferredStakes,
    loadingClaimable, // NEW: Loading state for claimable
    error,
    refreshReferralData,
    fetchUserReferralData,
    fetchClaimableOnly // NEW: Function to refresh only claimable amount
  };
};