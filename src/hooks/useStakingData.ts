import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { retryWithBackoff, createFallbackProvider } from '../utils/ethersUtils';

// Helper function to create provider with multiple RPC endpoints
const createStakingProvider = () => {
  return createFallbackProvider();
};

// Interfaces for staking data
export interface StakingPlan {
  id: number;
  name: string;
  apy: string; // Formatted APY (e.g., "6%")
  apyBasisPoints: number; // Raw APY in basis points
  lockPeriod: string; // Formatted lock period (e.g., "90 Days")
  lockDuration: number; // Raw lock duration in seconds
  minStake: string; // Formatted min stake (e.g., "100")
  minStakeAmount: string; // Raw min stake amount in wei
  earlyUnstakeFee: string; // Formatted fee (e.g., "12%")
  earlyUnstakeFeeBasisPoints: number; // Raw fee in basis points
  features: string[];
  active: boolean;
}

export interface UserStake {
  stakeIndex: number;
  planId: number;
  planName: string;
  amount: string; // Formatted amount (e.g., "1000.00")
  amountWei: string; // Raw amount in wei
  startTime: number;
  lastClaimTime: number;
  referrer: string;
  referralBonusClaimed: string; // Raw amount in wei
  pendingRewards: string; // Formatted pending rewards
  pendingRewardsWei: string; // Raw pending rewards in wei
  canUnstake: boolean;
  isLocked: boolean;
  lockEndTime: number;
}

export interface StakingStats {
  totalStaked: string; // Formatted total staked
  totalStakers: string; // Number of unique stakers
  avgApy: string; // Average APY across all plans
  rewardsPaid: string; // Total rewards distributed
  contractBalance: string; // Contract token balance
}

export interface UserStakingData {
  totalStakedAmount: string; // Formatted total staked by user
  totalStakedAmountWei: string; // Raw total staked in wei
  totalReferralEarnings: string; // Formatted referral earnings
  totalReferralEarningsWei: string; // Raw referral earnings in wei
  userDirectReferralCount: string; // Number of direct referrals made by user
  stakes: UserStake[];
  pendingRewardsTotal: string; // Total pending rewards across all stakes
  activeStakesCount: number;
}

export interface UseStakingDataReturn {
  // Contract data
  stakingPlans: StakingPlan[];
  stakingStats: StakingStats;
  referralCommissionBasisPoints: number;
  
  // User data (requires wallet connection)
  userStakingData: UserStakingData | null;
  
  // State management
  loading: boolean;
  error: string | null;
  
  // Functions
  refresh: () => void;
  refreshUserData: (walletAddress: string) => void;
  
  // Contract interaction functions
  stakeTokens: (planId: number, amount: string, referrer?: string) => Promise<boolean>;
  unstakeTokens: (stakeIndex: number) => Promise<boolean>;
  claimRewards: (stakeIndex: number) => Promise<boolean>;
  approveTokens: (amount: string) => Promise<boolean>;
  checkAllowance: (userAddress: string) => Promise<string>;
  fetchUserOneDreamBalance: (userAddress: string) => Promise<string>;
  claimReferralBonus: (stakerAddress: string, stakeIndex: number) => Promise<boolean>;
  claimAllReferralBonuses: (referrerAddress: string) => Promise<boolean>;

  // Admin functions
  addStakingPlan: (planData: any) => Promise<boolean>;
  updateStakingPlan: (planId: number, planData: any) => Promise<boolean>;
  checkIsOwner: (userAddress: string) => Promise<boolean>;
  setReferralCommission: (commissionBasisPoints: number) => Promise<boolean>;
}

// Contract addresses and ABIs - UPDATE THESE WITH YOUR DEPLOYED CONTRACT
// V3 Contract Address - Updated with improved referral tracking
const STAKING_CONTRACT_ADDRESS = '0xded53d0b2dd7be3c30243e97b65b8a6647c61108';
const TOKEN_CONTRACT_ADDRESS = '0x0C98F3e79061E0dB9569cd2574d8aac0d5023965';

// V3 Contract deployment block (BSC Mainnet) - for event queries
const V3_DEPLOYMENT_BLOCK = 43436500;

// Multicall3 contract address on BSC Mainnet
const MULTICALL_ADDRESS = '0xca11bde05977b363a0dcdcdcc1ce80336d51aaae';

// Multicall3 ABI (minimal required functions)
const MULTICALL_ABI = [
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "requireSuccess",
        "type": "bool"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "callData",
            "type": "bytes"
          }
        ],
        "internalType": "struct Multicall3.Call[]",
        "name": "calls",
        "type": "tuple[]"
      }
    ],
    "name": "tryAggregate",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "success",
            "type": "bool"
          },
          {
            "internalType": "bytes",
            "name": "returnData",
            "type": "bytes"
          }
        ],
        "internalType": "struct Multicall3.Result[]",
        "name": "returnData",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Updated Staking Contract ABI (V2) - Import from contracts folder
// V3 ABI with stakeIndex in events for better referral tracking
import STAKING_CONTRACT_ABI_JSON from '../../contracts/OneDreamStakingV3_ABI.json';
const STAKING_CONTRACT_ABI = STAKING_CONTRACT_ABI_JSON;

// ERC20 Token ABI (for approval and allowance)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
];

export const useStakingData = (): UseStakingDataReturn => {
  const [stakingPlans, setStakingPlans] = useState<StakingPlan[]>([]);
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: '0.00',
    totalStakers: '0',
    avgApy: '0.00%',
    rewardsPaid: '0.00',
    contractBalance: '0.00'
  });
  const [referralCommissionBasisPoints, setReferralCommissionBasisPoints] = useState<number>(500);
  const [userStakingData, setUserStakingData] = useState<UserStakingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache for staking plans to avoid repeated fetches
  const [plansCache, setPlansCache] = useState<{
    plans: StakingPlan[];
    timestamp: number;
    stats: StakingStats;
    referralCommissionBasisPoints?: number;
  } | null>(null);

  // Cache duration: 30 minutes (aggressive caching)
  const CACHE_DURATION = 30 * 60 * 1000;

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

  // Helper function to format APY from basis points
  const formatApy = (basisPoints: number): string => {
    return (basisPoints / 100).toFixed(0) + '%';
  };

  // Helper function to format lock duration
  const formatLockDuration = (seconds: number): string => {
    if (seconds === 0) return 'No Lock';
    const days = Math.floor(seconds / (24 * 60 * 60));
    return `${days} Days`;
  };

  // Fetch staking plans and general stats from contract
  const fetchStakingData = async (forceRefresh: boolean = false) => {
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh && plansCache) {
      const now = Date.now();
      const cacheAge = now - plansCache.timestamp;
      
      if (cacheAge < CACHE_DURATION) {
        // Use cached data
        setStakingPlans(plansCache.plans);
        setStakingStats(plansCache.stats);
        setReferralCommissionBasisPoints(plansCache.referralCommissionBasisPoints || 500);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const provider = createStakingProvider();
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);
      const multicallContract = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider);

      // Prepare multicall data
      const stakingInterface = new ethers.Interface(STAKING_CONTRACT_ABI);
      
      const calls = [
        {
          target: STAKING_CONTRACT_ADDRESS,
          callData: stakingInterface.encodeFunctionData('getActiveStakingPlans', [])
        },
        {
          target: STAKING_CONTRACT_ADDRESS,
          callData: stakingInterface.encodeFunctionData('getContractTokenBalance', [])
        },
        {
          target: STAKING_CONTRACT_ADDRESS,
          callData: stakingInterface.encodeFunctionData('getTotalUniqueStakers', [])
        },
        {
          target: STAKING_CONTRACT_ADDRESS,
          callData: stakingInterface.encodeFunctionData('referralCommissionBasisPoints', [])
        }
      ];

      // Execute multicall (single RPC request)
      const multicallResults = await retryWithBackoff(() =>
        multicallContract.getFunction("tryAggregate").staticCall(false, calls),
        3, // Minimal retries for multicall
        1000 // Fast retry delay
      );
      
      // Decode results
      const [rawPlans, contractBalance, totalUniqueStakers, commissionBasisPoints] = multicallResults.map((result: any, index: number) => {
        if (!result.success) {
          throw new Error(`Multicall failed for call ${index}`);
        }
        
        switch (index) {
          case 0: // getActiveStakingPlans
            return stakingInterface.decodeFunctionResult('getActiveStakingPlans', result.returnData)[0];
          case 1: // getContractTokenBalance
            return stakingInterface.decodeFunctionResult('getContractTokenBalance', result.returnData)[0];
          case 2: // getTotalUniqueStakers
            return stakingInterface.decodeFunctionResult('getTotalUniqueStakers', result.returnData)[0];
          case 3: // referralCommissionBasisPoints
            return stakingInterface.decodeFunctionResult('referralCommissionBasisPoints', result.returnData)[0];
          default:
            throw new Error(`Unknown multicall result index: ${index}`);
        }
      });

      // Process staking plans
      const formattedPlans: StakingPlan[] = rawPlans.map((plan: any) => ({
        id: Number(plan.id),
        name: plan.name,
        apy: formatApy(Number(plan.apyBasisPoints)),
        apyBasisPoints: Number(plan.apyBasisPoints),
        lockPeriod: formatLockDuration(Number(plan.lockDuration)),
        lockDuration: Number(plan.lockDuration),
        minStake: formatTokenAmount(plan.minStakeAmount.toString()),
        minStakeAmount: plan.minStakeAmount.toString(),
        earlyUnstakeFee: formatApy(Number(plan.earlyUnstakeFeeBasisPoints)),
        earlyUnstakeFeeBasisPoints: Number(plan.earlyUnstakeFeeBasisPoints),
        features: generatePlanFeatures(plan),
        active: plan.active
      }));

      const stats = {
        totalStaked: formatTokenAmount(contractBalance.toString()),
        totalStakers: totalUniqueStakers.toString(),
        avgApy: calculateAverageApy(formattedPlans),
        rewardsPaid: '0.00', // This would need to be tracked separately or calculated from events
        contractBalance: formatTokenAmount(contractBalance.toString())
      };

      // Update state
      setStakingPlans(formattedPlans);
      setStakingStats(stats);
      setReferralCommissionBasisPoints(Number(commissionBasisPoints));

      // Update cache
      setPlansCache({
        plans: formattedPlans,
        stats: stats,
        referralCommissionBasisPoints: Number(commissionBasisPoints),
        timestamp: Date.now()
      });

    } catch (err) {
      console.warn('Multicall failed, trying individual calls:', err);

      // Fallback to individual contract calls
      try {
        const provider = createStakingProvider();
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

        const [rawPlans, contractBalance, totalUniqueStakers, commissionBasisPoints] = await Promise.all([
          retryWithBackoff(() => stakingContract.getActiveStakingPlans(), 3, 1000),
          retryWithBackoff(() => stakingContract.getContractTokenBalance(), 3, 1000),
          retryWithBackoff(() => stakingContract.getTotalUniqueStakers(), 3, 1000),
          retryWithBackoff(() => stakingContract.referralCommissionBasisPoints(), 3, 1000)
        ]);

        // Process the data same as before
        const formattedPlans: StakingPlan[] = rawPlans.map((plan: any) => ({
          id: Number(plan.id),
          name: plan.name,
          apy: formatApy(Number(plan.apyBasisPoints)),
          apyBasisPoints: Number(plan.apyBasisPoints),
          lockPeriod: formatLockDuration(Number(plan.lockDuration)),
          lockDuration: Number(plan.lockDuration),
          minStake: formatTokenAmount(plan.minStakeAmount.toString()),
          minStakeAmount: plan.minStakeAmount.toString(),
          earlyUnstakeFee: formatApy(Number(plan.earlyUnstakeFeeBasisPoints)),
          earlyUnstakeFeeBasisPoints: Number(plan.earlyUnstakeFeeBasisPoints),
          features: generatePlanFeatures(plan),
          active: plan.active
        }));

        const stats = {
          totalStaked: formatTokenAmount(contractBalance.toString()),
          totalStakers: totalUniqueStakers.toString(),
          avgApy: calculateAverageApy(formattedPlans),
          rewardsPaid: '0.00',
          contractBalance: formatTokenAmount(contractBalance.toString())
        };

        setStakingPlans(formattedPlans);
        setStakingStats(stats);
        setReferralCommissionBasisPoints(Number(commissionBasisPoints));

        setPlansCache({
          plans: formattedPlans,
          stats: stats,
          referralCommissionBasisPoints: Number(commissionBasisPoints),
          timestamp: Date.now()
        });

        // Clear any existing error since fallback succeeded
        setError(null);

      } catch (fallbackErr) {
        console.error('Both multicall and individual calls failed:', fallbackErr);
        setError('Failed to fetch staking data from contract');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cache for user data to avoid repeated fetches
  const [userDataCache, setUserDataCache] = useState<Map<string, {
    data: UserStakingData;
    timestamp: number;
  }>>(new Map());

  // User data cache duration: 2 minutes
  const USER_CACHE_DURATION = 2 * 60 * 1000;

  // Fetch user-specific staking data (optimized - no event queries here)
  const fetchUserStakingData = React.useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      console.log('fetchUserStakingData: No wallet address provided');
      setUserStakingData(null);
      return;
    }

    console.log('fetchUserStakingData: Starting fetch for', walletAddress);

    // Check user data cache
    const cachedUserData = userDataCache.get(walletAddress.toLowerCase());
    if (cachedUserData) {
      const now = Date.now();
      const cacheAge = now - cachedUserData.timestamp;

      if (cacheAge < USER_CACHE_DURATION) {
        console.log('fetchUserStakingData: Using cached data');
        setUserStakingData(cachedUserData.data);
        return;
      }
    }

    try {
      const provider = createStakingProvider();
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);
      const multicallContract = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider);
      const stakingInterface = new ethers.Interface(STAKING_CONTRACT_ABI);

      // Prepare multicall for basic user data
      const basicUserCalls = [
        {
          target: STAKING_CONTRACT_ADDRESS,
          callData: stakingInterface.encodeFunctionData('getUserTotalStakedAmount', [walletAddress])
        },
        {
          target: STAKING_CONTRACT_ADDRESS,
          callData: stakingInterface.encodeFunctionData('getReferrerTotalEarnings', [walletAddress])
        },
        {
          target: STAKING_CONTRACT_ADDRESS,
          callData: stakingInterface.encodeFunctionData('getAllUserStakes', [walletAddress])
        },
        {
          target: STAKING_CONTRACT_ADDRESS,
          callData: stakingInterface.encodeFunctionData('getDirectReferralCount', [walletAddress])
        }
      ];

      // Execute multicall for basic user data
      const basicResults = await retryWithBackoff(() =>
        multicallContract.getFunction("tryAggregate").staticCall(false, basicUserCalls)
      , 3, 1000);
      
      // Decode basic results
      const [totalStakedWei, referralEarningsWei, rawStakes, contractDirectReferralCount] = basicResults.map((result: any, index: number) => {
        if (!result.success) {
          throw new Error(`User data multicall failed for call ${index}`);
        }
        
        switch (index) {
          case 0: // getUserTotalStakedAmount
            return stakingInterface.decodeFunctionResult('getUserTotalStakedAmount', result.returnData)[0];
          case 1: // getReferrerTotalEarnings
            return stakingInterface.decodeFunctionResult('getReferrerTotalEarnings', result.returnData)[0];
          case 2: // getAllUserStakes
            return stakingInterface.decodeFunctionResult('getAllUserStakes', result.returnData)[0];
          case 3: // getDirectReferralCount
            return stakingInterface.decodeFunctionResult('getDirectReferralCount', result.returnData)[0];
          default:
            throw new Error(`Unknown user data multicall result index: ${index}`);
        }
      });

      // Prepare multicall for stake-specific data (pending rewards and plan details)
      const stakes: UserStake[] = [];
      let totalPendingRewardsWei = BigInt(0);
      
      if (rawStakes.length > 0) {
        // Prepare calls for all stakes at once
        const stakeCalls = [];
        
        // Add pending reward calls for each stake
        for (let i = 0; i < rawStakes.length; i++) {
          stakeCalls.push({
            target: STAKING_CONTRACT_ADDRESS,
            callData: stakingInterface.encodeFunctionData('calculatePendingReward', [walletAddress, i])
          });
        }
        
        // Add plan detail calls for unique plan IDs
        const uniquePlanIds = [...new Set(rawStakes.map((stake: any) => Number(stake.planId)))];
        const planCallStartIndex = rawStakes.length;
        
        for (const planId of uniquePlanIds) {
          stakeCalls.push({
            target: STAKING_CONTRACT_ADDRESS,
            callData: stakingInterface.encodeFunctionData('getStakingPlan', [planId])
          });
        }
        
        // Execute multicall for all stake data with optimized batching
        const stakeResults = await retryWithBackoff(async () => {
          try {
            return await multicallContract.getFunction("tryAggregate").staticCall(false, stakeCalls);
          } catch (error) {
            console.warn('Stake multicall failed, trying with smaller batches:', error);

            // If multicall fails, split into smaller batches
            const BATCH_SIZE = 10;
            const allResults = [];

            for (let i = 0; i < stakeCalls.length; i += BATCH_SIZE) {
              const batch = stakeCalls.slice(i, i + BATCH_SIZE);
              try {
                const batchResults = await multicallContract.getFunction("tryAggregate").staticCall(false, batch);
                allResults.push(...batchResults);
              } catch (batchError) {
                console.warn(`Batch ${i / BATCH_SIZE + 1} failed, using individual calls:`, batchError);
                // Fallback to individual calls for this batch
                for (const call of batch) {
                  try {
                    const result = await provider.call({
                      to: call.target,
                      data: call.callData
                    });
                    allResults.push({ success: true, returnData: result });
                  } catch (callError) {
                    console.warn('Individual stake call failed:', callError);
                    allResults.push({ success: false, returnData: '0x' });
                  }
                }
              }
            }
            return allResults;
          }
        }, 3, 1000); // Reduced retries and faster delay
        
        // Decode pending rewards
        const pendingRewards = stakeResults.slice(0, rawStakes.length).map((result: any, index: number) => {
          if (!result.success) {
            console.warn(`Pending reward call failed for stake ${index}`);
            return BigInt(0);
          }
          return stakingInterface.decodeFunctionResult('calculatePendingReward', result.returnData)[0];
        });
        
        // Decode plan details and create a map
        const planDetailsMap = new Map();
        uniquePlanIds.forEach((planId, index) => {
          const resultIndex = planCallStartIndex + index;
          if (stakeResults[resultIndex]?.success) {
            const planData = stakingInterface.decodeFunctionResult('getStakingPlan', stakeResults[resultIndex].returnData);
            planDetailsMap.set(planId, {
              id: planData[0],
              name: planData[1],
              apyBasisPoints: planData[2],
              lockDuration: planData[3],
              earlyUnstakeFeeBasisPoints: planData[4],
              minStakeAmount: planData[5],
              active: planData[6]
            });
          }
        });
        
        // Process stakes with multicall results
        for (let i = 0; i < rawStakes.length; i++) {
          const stake = rawStakes[i];
          const pendingRewardsWei = pendingRewards[i];
          const planDetails = planDetailsMap.get(Number(stake.planId));
          
          if (!planDetails) {
            console.warn(`Plan details not found for planId ${stake.planId}`);
            continue;
          }
          
          const currentTime = Math.floor(Date.now() / 1000);
          const lockEndTime = Number(stake.startTime) + Number(planDetails.lockDuration);
          const isLocked = Number(planDetails.lockDuration) > 0 && currentTime < lockEndTime;

          stakes.push({
            stakeIndex: i,
            planId: Number(stake.planId),
            planName: planDetails.name,
            amount: formatTokenAmount(stake.amount.toString()),
            amountWei: stake.amount.toString(),
            startTime: Number(stake.startTime),
            lastClaimTime: Number(stake.lastClaimTime),
            referrer: stake.referrer,
            referralBonusClaimed: stake.referralBonusClaimed.toString(),
            pendingRewards: formatTokenAmount(pendingRewardsWei.toString()),
            pendingRewardsWei: pendingRewardsWei.toString(),
            canUnstake: true,
            isLocked,
            lockEndTime
          });

          totalPendingRewardsWei += BigInt(pendingRewardsWei.toString());
        }
      }

      const userData: UserStakingData = {
        totalStakedAmount: formatTokenAmount(totalStakedWei.toString()),
        totalStakedAmountWei: totalStakedWei.toString(),
        totalReferralEarnings: formatTokenAmount(referralEarningsWei.toString()),
        totalReferralEarningsWei: referralEarningsWei.toString(),
        userDirectReferralCount: contractDirectReferralCount.toString(),
        stakes,
        pendingRewardsTotal: formatTokenAmount(totalPendingRewardsWei.toString()),
        activeStakesCount: stakes.length
      };

      console.log('User staking data fetched successfully:', {
        address: walletAddress,
        totalStaked: userData.totalStakedAmount,
        stakesCount: stakes.length,
        stakes: stakes
      });

      setUserStakingData(userData);

      // Update user data cache
      const newCache = new Map(userDataCache);
      newCache.set(walletAddress.toLowerCase(), {
        data: userData,
        timestamp: Date.now()
      });
      setUserDataCache(newCache);

    } catch (err) {
      console.error('Error fetching user staking data (multicall failed):', err);

      // Fallback to individual calls
      try {
        console.log('Attempting fallback with individual contract calls...');
        const provider = createStakingProvider();
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

        // Fetch basic user data with individual calls
        const [totalStakedWei, referralEarningsWei, rawStakes, contractDirectReferralCount] = await Promise.all([
          retryWithBackoff(() => stakingContract.getUserTotalStakedAmount(walletAddress), 3, 1000),
          retryWithBackoff(() => stakingContract.getReferrerTotalEarnings(walletAddress), 3, 1000),
          retryWithBackoff(() => stakingContract.getAllUserStakes(walletAddress), 3, 1000),
          retryWithBackoff(() => stakingContract.getDirectReferralCount(walletAddress), 3, 1000)
        ]);

        // Process stakes
        const stakes: UserStake[] = [];
        let totalPendingRewardsWei = BigInt(0);

        if (rawStakes.length > 0) {
          // Fetch pending rewards and plan details for each stake
          for (let i = 0; i < rawStakes.length; i++) {
            const stake = rawStakes[i];

            try {
              const [pendingRewardsWei, planDetails] = await Promise.all([
                retryWithBackoff(() => stakingContract.calculatePendingReward(walletAddress, i), 2, 500),
                retryWithBackoff(() => stakingContract.getStakingPlan(Number(stake.planId)), 2, 500)
              ]);

              const currentTime = Math.floor(Date.now() / 1000);
              const lockEndTime = Number(stake.startTime) + Number(planDetails.lockDuration);
              const isLocked = Number(planDetails.lockDuration) > 0 && currentTime < lockEndTime;

              stakes.push({
                stakeIndex: i,
                planId: Number(stake.planId),
                planName: planDetails.name,
                amount: formatTokenAmount(stake.amount.toString()),
                amountWei: stake.amount.toString(),
                startTime: Number(stake.startTime),
                lastClaimTime: Number(stake.lastClaimTime),
                referrer: stake.referrer,
                referralBonusClaimed: stake.referralBonusClaimed.toString(),
                pendingRewards: formatTokenAmount(pendingRewardsWei.toString()),
                pendingRewardsWei: pendingRewardsWei.toString(),
                canUnstake: true,
                isLocked,
                lockEndTime
              });

              totalPendingRewardsWei += BigInt(pendingRewardsWei.toString());
            } catch (stakeErr) {
              console.warn(`Failed to fetch data for stake ${i}:`, stakeErr);
            }
          }
        }

        const userData: UserStakingData = {
          totalStakedAmount: formatTokenAmount(totalStakedWei.toString()),
          totalStakedAmountWei: totalStakedWei.toString(),
          totalReferralEarnings: formatTokenAmount(referralEarningsWei.toString()),
          totalReferralEarningsWei: referralEarningsWei.toString(),
          userDirectReferralCount: contractDirectReferralCount.toString(),
          stakes,
          pendingRewardsTotal: formatTokenAmount(totalPendingRewardsWei.toString()),
          activeStakesCount: stakes.length
        };

        console.log('User staking data fetched successfully (via fallback):', {
          address: walletAddress,
          totalStaked: userData.totalStakedAmount,
          stakesCount: stakes.length,
          stakes: stakes
        });

        setUserStakingData(userData);

        // Update user data cache
        const newCache = new Map(userDataCache);
        newCache.set(walletAddress.toLowerCase(), {
          data: userData,
          timestamp: Date.now()
        });
        setUserDataCache(newCache);

        // Clear any existing error since fallback succeeded
        setError(null);

      } catch (fallbackErr) {
        console.error('Both multicall and individual calls failed for user data:', fallbackErr);
        console.error('Fallback error details:', {
          message: fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error',
          stack: fallbackErr instanceof Error ? fallbackErr.stack : undefined,
          walletAddress
        });
        setError('Failed to fetch user staking data');
        setUserStakingData(null);
      }
    }
  }, [userDataCache, setUserStakingData, setError]);

  // Helper function to generate plan features based on new plans
  const generatePlanFeatures = (plan: any): string[] => {
    const features = [];
    
    if (Number(plan.lockDuration) === 0) {
      features.push('Withdraw anytime', 'Daily rewards', 'No penalties');
    } else {
      features.push('Higher APY', 'Bonus rewards');
      if (Number(plan.earlyUnstakeFeeBasisPoints) > 0) {
        features.push(`Early unlock fee: ${formatApy(Number(plan.earlyUnstakeFeeBasisPoints))}`);
      }
    }
    
    return features;
  };

  // Helper function to calculate average APY
  const calculateAverageApy = (plans: StakingPlan[]): string => {
    if (plans.length === 0) return '0%';
    const totalApy = plans.reduce((sum, plan) => sum + plan.apyBasisPoints, 0);
    return formatApy(totalApy / plans.length);
  };

  // Contract interaction functions
  const stakeTokens = async (planId: number, amount: string, referrer?: string): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      
      const amountWei = ethers.parseUnits(amount, 18);
      const referrerAddress = referrer || ethers.ZeroAddress;
      
      const tx = await stakingContract.stake(planId, amountWei, referrerAddress);
      await tx.wait();
      
      return true;
    } catch (err) {
      console.error('Error staking tokens:', err);
      setError('Failed to stake tokens');
      return false;
    }
  };

  const unstakeTokens = async (stakeIndex: number): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      
      const tx = await stakingContract.unstake(stakeIndex);
      await tx.wait();
      
      return true;
    } catch (err) {
      console.error('Error unstaking tokens:', err);
      setError('Failed to unstake tokens');
      return false;
    }
  };

  const claimRewards = async (stakeIndex: number): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      
      const tx = await stakingContract.claimRewards(stakeIndex);
      await tx.wait();
      
      return true;
    } catch (err) {
      console.error('Error claiming rewards:', err);
      setError('Failed to claim rewards');
      return false;
    }
  };

  const claimReferralBonus = async (stakerAddress: string, stakeIndex: number): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);

      const tx = await stakingContract.claimReferralBonus(stakerAddress, stakeIndex);
      await tx.wait();

      return true;
    } catch (err) {
      console.error('Error claiming referral bonus:', err);
      setError('Failed to claim referral bonus');
      return false;
    }
  };

  const claimAllReferralBonuses = async (referrerAddress: string): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');

      console.log('[CLAIM ALL] Starting claim process for:', referrerAddress);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);

      // Get all claimable bonuses
      const result = await stakingContract.getClaimableReferralBonuses(referrerAddress);
      const [stakers, stakeIndexes, bonusAmounts] = result;

      console.log('[CLAIM ALL] Found', stakers.length, 'claimable bonuses');
      console.log('[CLAIM ALL] Stakers:', stakers);
      console.log('[CLAIM ALL] Indexes:', stakeIndexes);
      console.log('[CLAIM ALL] Amounts:', bonusAmounts);

      if (!stakers || stakers.length === 0) {
        console.log('[CLAIM ALL] No bonuses to claim');
        setError('No referral bonuses available to claim');
        return false;
      }

      // Claim each bonus
      for (let i = 0; i < stakers.length; i++) {
        console.log(`[CLAIM ALL] Claiming bonus ${i + 1}/${stakers.length} from ${stakers[i]} stake ${stakeIndexes[i]}`);
        const tx = await stakingContract.claimReferralBonus(stakers[i], stakeIndexes[i]);
        await tx.wait();
        console.log(`[CLAIM ALL] Claimed bonus ${i + 1}/${stakers.length} successfully`);
      }

      console.log('[CLAIM ALL] All bonuses claimed successfully');
      return true;
    } catch (err) {
      console.error('[CLAIM ALL] Error claiming referral bonuses:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim referral bonuses');
      return false;
    }
  };

  const approveTokens = async (amount: string): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, signer);
      
      const amountWei = ethers.parseUnits(amount, 18);
      const tx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountWei);
      await tx.wait();
      
      return true;
    } catch (err) {
      console.error('Error approving tokens:', err);
      setError('Failed to approve tokens');
      return false;
    }
  };

  const checkAllowance = async (userAddress: string): Promise<string> => {
    try {
      const provider = createStakingProvider();
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
      
      const allowance = await retryWithBackoff(() => tokenContract.allowance(userAddress, STAKING_CONTRACT_ADDRESS));
      return ethers.formatUnits(allowance, 18);
    } catch (err) {
      console.error('Error checking allowance:', err);
      return '0';
    }
  };

  // Fetch user's 1DREAM token balance
  const fetchUserOneDreamBalance = async (userAddress: string): Promise<string> => {
    try {
      const provider = createStakingProvider();
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
      
      const balance = await retryWithBackoff(() => tokenContract.balanceOf(userAddress));
      return ethers.formatUnits(balance, 18);
    } catch (err) {
      console.error('Error fetching 1DREAM balance:', err);
      return '0';
    }
  };

  // Admin function to add staking plan
  const addStakingPlan = async (planData: any): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      
      // Convert input values to contract format
      const apyBasisPoints = Math.floor(planData.apyPercentage * 100); // Convert percentage to basis points
      const lockDurationSeconds = planData.lockDurationDays * 24 * 60 * 60; // Convert days to seconds
      const minStakeAmountWei = ethers.parseUnits(planData.minStakeAmount.toString(), 18); // Convert to Wei
      const earlyUnstakeFeeBasisPoints = Math.floor(planData.earlyUnstakeFeePercentage * 100); // Convert percentage to basis points
      
      const tx = await stakingContract.addStakingPlan(
        planData.name,
        apyBasisPoints,
        lockDurationSeconds,
        earlyUnstakeFeeBasisPoints,
        minStakeAmountWei,
        planData.active
      );
      
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Error adding staking plan:', err);
      setError('Failed to add staking plan');
      return false;
    }
  };

  // Admin function to update staking plan
  const updateStakingPlan = async (planId: number, planData: any): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      
      // Convert input values to contract format
      const apyBasisPoints = Math.floor(planData.apyPercentage * 100);
      const lockDurationSeconds = planData.lockDurationDays * 24 * 60 * 60;
      const minStakeAmountWei = ethers.parseUnits(planData.minStakeAmount.toString(), 18);
      const earlyUnstakeFeeBasisPoints = Math.floor(planData.earlyUnstakeFeePercentage * 100);
      
      const tx = await stakingContract.updateStakingPlan(
        planId,
        planData.name,
        apyBasisPoints,
        lockDurationSeconds,
        earlyUnstakeFeeBasisPoints,
        minStakeAmountWei,
        planData.active
      );
      
      await tx.wait();
      return true;
    } catch (err) {
      console.error('Error updating staking plan:', err);
      setError('Failed to update staking plan');
      return false;
    }
  };

  // Admin function to set referral commission
  const setReferralCommission = async (commissionBasisPoints: number): Promise<boolean> => {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      if (!signer || typeof signer.sendTransaction !== 'function') {
        throw new Error('Invalid signer object obtained from wallet.');
      }
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, signer);
      
      const tx = await stakingContract.setReferralCommission(commissionBasisPoints);
      await tx.wait();
      
      return true;
    } catch (err) {
      console.error('Error setting referral commission:', err);
      setError('Failed to set referral commission');
      return false;
    }
  };

  // Check if user is contract owner
  const checkIsOwner = React.useCallback(async (userAddress: string): Promise<boolean> => {
    try {
      const provider = createStakingProvider();
      const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);
      
      const owner = await retryWithBackoff(() => stakingContract.owner());
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (err) {
      console.error('Error checking owner:', err);
      return false;
    }
  }, []);

  // Refresh
  const refresh = React.useCallback(() => {
    fetchStakingData(true); // Force refresh by bypassing cache
  }, []);

  const refreshUserData = React.useCallback((walletAddress: string) => {
    console.log('refreshUserData called with address:', walletAddress);
    fetchUserStakingData(walletAddress);
  }, [fetchUserStakingData]);

  // Initial data fetch on mount
  React.useEffect(() => {
    fetchStakingData();
  }, []);

  return {
    // Contract data
    stakingPlans,
    stakingStats,
    referralCommissionBasisPoints,
    
    // User data
    userStakingData,
    
    // State management
    loading,
    error,
    
    // Functions
    refresh,
    refreshUserData,
    
    // Contract interaction functions
    stakeTokens,
    unstakeTokens,
    claimRewards,
    approveTokens,
    checkAllowance,
    fetchUserOneDreamBalance,
    claimReferralBonus,
    claimAllReferralBonuses,
    
    // Admin functions
    addStakingPlan,
    updateStakingPlan,
    checkIsOwner,
    setReferralCommission
  };
};