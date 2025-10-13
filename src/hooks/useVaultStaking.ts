import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { retryWithBackoff, createFallbackProvider } from '../utils/ethersUtils';
import VaultStakingABI from '../../contracts/OneDreamVaultStaking_ABI.json';

// Contract will be deployed and address updated here
const VAULT_STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_VAULT_STAKING_CONTRACT || '';

interface StakingPackage {
  id: number;
  name: string;
  minAmount: string;
  maxAmount: string;
  dailyRateBasisPoints: number;
  dailyRate: string;
  baseDurationDays: number;
  referralBonusDays: number;
  closingBonusBasisPoints: number;
  closingBonusRate: string;
  active: boolean;
}

interface UserStake {
  packageId: number;
  usdtAmount: string;
  startTime: number;
  lastClaimTime: number;
  baseDurationDays: number;
  referralCount: number;
  totalDurationDays: number;
  restakeCount: number;
  restakeBonus: string;
  restakeBonusClaimed: boolean;
  closingBonus: string;
  closingBonusClaimed: boolean;
  referrer: string;
  isActive: boolean;
}

interface ContractStats {
  totalUsdtStaked: string;
  totalStakers: number;
  totalRewardsPaid: string;
  usdtBalance: string;
  oneDreamBalance: string;
  currentOneDreamPrice: string;
}

interface ReferralStats {
  totalReferralCount: number;
  referredUsers: string[];
}

export const useVaultStaking = (walletAddress: string, signer?: ethers.Signer) => {
  const [packages, setPackages] = useState<StakingPackage[]>([]);
  const [userStake, setUserStake] = useState<UserStake | null>(null);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [oneDreamPrice, setOneDreamPrice] = useState<string>('0');
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Create contract instance
  const getContract = useCallback((withSigner: boolean = false) => {
    if (!VAULT_STAKING_CONTRACT_ADDRESS) {
      throw new Error('Vault staking contract address not configured');
    }

    if (withSigner && signer) {
      return new ethers.Contract(VAULT_STAKING_CONTRACT_ADDRESS, VaultStakingABI, signer);
    }

    const provider = createFallbackProvider();
    return new ethers.Contract(VAULT_STAKING_CONTRACT_ADDRESS, VaultStakingABI, provider);
  }, [signer]);

  // Fetch all packages
  const fetchPackages = useCallback(async () => {
    try {
      const contract = getContract();
      const activePackages = await retryWithBackoff(() => contract.getActivePackages());

      const formattedPackages: StakingPackage[] = activePackages.map((pkg: any) => ({
        id: Number(pkg.id),
        name: pkg.name,
        minAmount: ethers.formatUnits(pkg.minAmount, 18),
        maxAmount: ethers.formatUnits(pkg.maxAmount, 18),
        dailyRateBasisPoints: Number(pkg.dailyRateBasisPoints),
        dailyRate: `${(Number(pkg.dailyRateBasisPoints) / 100).toFixed(2)}%`,
        baseDurationDays: Number(pkg.baseDurationDays),
        referralBonusDays: Number(pkg.referralBonusDays),
        closingBonusBasisPoints: Number(pkg.closingBonusBasisPoints),
        closingBonusRate: `${(Number(pkg.closingBonusBasisPoints) / 100).toFixed(0)}%`,
        active: pkg.active
      }));

      setPackages(formattedPackages);
      return formattedPackages;
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to load staking packages');
      return [];
    }
  }, [getContract]);

  // Fetch user stake
  const fetchUserStake = useCallback(async () => {
    if (!walletAddress) return null;

    try {
      const contract = getContract();

      // Fetch all three parts of user stake data
      const [basic, duration, bonus] = await Promise.all([
        retryWithBackoff(() => contract.getUserStakeBasic(walletAddress)),
        retryWithBackoff(() => contract.getUserStakeDuration(walletAddress)),
        retryWithBackoff(() => contract.getUserStakeBonus(walletAddress))
      ]);

      if (!basic.isActive) {
        setUserStake(null);
        return null;
      }

      const formattedStake: UserStake = {
        packageId: Number(basic.packageId),
        usdtAmount: ethers.formatUnits(basic.usdtAmount, 18),
        startTime: Number(basic.startTime),
        lastClaimTime: Number(basic.lastClaimTime),
        baseDurationDays: Number(duration.baseDurationDays),
        referralCount: Number(duration.referralCount),
        totalDurationDays: Number(duration.totalDurationDays),
        restakeCount: Number(duration.restakeCount),
        restakeBonus: ethers.formatUnits(bonus.restakeBonus, 18),
        restakeBonusClaimed: bonus.restakeBonusClaimed,
        closingBonus: ethers.formatUnits(bonus.closingBonus, 18),
        closingBonusClaimed: bonus.closingBonusClaimed,
        referrer: bonus.referrer,
        isActive: basic.isActive
      };

      setUserStake(formattedStake);
      return formattedStake;
    } catch (err) {
      console.error('Error fetching user stake:', err);
      return null;
    }
  }, [walletAddress, getContract]);

  // Fetch contract stats
  const fetchContractStats = useCallback(async () => {
    try {
      const contract = getContract();
      const stats = await retryWithBackoff(() => contract.getContractStats());

      const formattedStats: ContractStats = {
        totalUsdtStaked: ethers.formatUnits(stats._totalUsdtStaked, 18),
        totalStakers: Number(stats._totalStakers),
        totalRewardsPaid: ethers.formatUnits(stats._totalRewardsPaid, 18),
        usdtBalance: ethers.formatUnits(stats.usdtBalance, 18),
        oneDreamBalance: ethers.formatUnits(stats.oneDreamBalance, 18),
        currentOneDreamPrice: ethers.formatUnits(stats.currentOneDreamPrice, 18)
      };

      setContractStats(formattedStats);
      setOneDreamPrice(formattedStats.currentOneDreamPrice);
      return formattedStats;
    } catch (err) {
      console.error('Error fetching contract stats:', err);
      return null;
    }
  }, [getContract]);

  // Fetch referral stats
  const fetchReferralStats = useCallback(async () => {
    if (!walletAddress) return null;

    try {
      const contract = getContract();
      const stats = await retryWithBackoff(() => contract.getReferralStats(walletAddress));

      const formattedStats: ReferralStats = {
        totalReferralCount: Number(stats.totalReferralCount),
        referredUsers: stats.referredUsersList
      };

      setReferralStats(formattedStats);
      return formattedStats;
    } catch (err) {
      console.error('Error fetching referral stats:', err);
      return null;
    }
  }, [walletAddress, getContract]);

  // Fetch pending rewards
  const fetchPendingRewards = useCallback(async () => {
    if (!walletAddress) return '0';

    try {
      const contract = getContract();
      const rewards = await retryWithBackoff(() => contract.calculatePendingRewards(walletAddress));
      const formatted = ethers.formatUnits(rewards, 18);
      setPendingRewards(formatted);
      return formatted;
    } catch (err) {
      console.error('Error fetching pending rewards:', err);
      return '0';
    }
  }, [walletAddress, getContract]);

  // Check if user is owner
  const checkIsOwner = useCallback(async () => {
    if (!walletAddress) return false;

    try {
      const contract = getContract();
      const owner = await retryWithBackoff(() => contract.owner());
      const isOwn = owner.toLowerCase() === walletAddress.toLowerCase();
      setIsOwner(isOwn);
      return isOwn;
    } catch (err) {
      console.error('Error checking owner:', err);
      return false;
    }
  }, [walletAddress, getContract]);

  // Stake function
  const stake = useCallback(async (packageId: number, usdtAmount: string, referrer: string = ethers.ZeroAddress) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = getContract(true);
      const amountWei = ethers.parseUnits(usdtAmount, 18);

      // First approve USDT
      const usdtAddress = await contract.usdtToken();
      const usdtContract = new ethers.Contract(
        usdtAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer
      );

      const approveTx = await usdtContract.approve(VAULT_STAKING_CONTRACT_ADDRESS, amountWei);
      await approveTx.wait();

      // Then stake
      const tx = await contract.stake(packageId, amountWei, referrer);
      await tx.wait();

      // Refresh data
      await Promise.all([
        fetchUserStake(),
        fetchContractStats(),
        fetchReferralStats()
      ]);

      return true;
    } catch (err: any) {
      console.error('Error staking:', err);
      throw new Error(err.message || 'Failed to stake');
    }
  }, [signer, getContract, fetchUserStake, fetchContractStats, fetchReferralStats]);

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = getContract(true);
      const tx = await contract.claimRewards();
      await tx.wait();

      // Refresh data
      await Promise.all([
        fetchPendingRewards(),
        fetchUserStake(),
        fetchContractStats()
      ]);

      return true;
    } catch (err: any) {
      console.error('Error claiming rewards:', err);
      throw new Error(err.message || 'Failed to claim rewards');
    }
  }, [signer, getContract, fetchPendingRewards, fetchUserStake, fetchContractStats]);

  // Claim re-stake bonus
  const claimRestakeBonus = useCallback(async () => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = getContract(true);
      const tx = await contract.claimRestakeBonus();
      await tx.wait();

      // Refresh data
      await Promise.all([
        fetchUserStake(),
        fetchContractStats()
      ]);

      return true;
    } catch (err: any) {
      console.error('Error claiming re-stake bonus:', err);
      throw new Error(err.message || 'Failed to claim re-stake bonus');
    }
  }, [signer, getContract, fetchUserStake, fetchContractStats]);

  // Claim closing bonus
  const claimClosingBonus = useCallback(async () => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = getContract(true);
      const tx = await contract.claimClosingBonus();
      await tx.wait();

      // Refresh data
      await Promise.all([
        fetchUserStake(),
        fetchContractStats()
      ]);

      return true;
    } catch (err: any) {
      console.error('Error claiming closing bonus:', err);
      throw new Error(err.message || 'Failed to claim closing bonus');
    }
  }, [signer, getContract, fetchUserStake, fetchContractStats]);

  // Complete stake
  const completeStake = useCallback(async () => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = getContract(true);
      const tx = await contract.completeStake();
      await tx.wait();

      // Refresh data
      await fetchUserStake();

      return true;
    } catch (err: any) {
      console.error('Error completing stake:', err);
      throw new Error(err.message || 'Failed to complete stake');
    }
  }, [signer, getContract, fetchUserStake]);

  // Admin: Create package
  const createPackage = useCallback(async (
    name: string,
    minAmount: string,
    maxAmount: string,
    dailyRateBP: number,
    baseDuration: number,
    referralBonus: number,
    closingBonusBP: number
  ) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = getContract(true);
      const minWei = ethers.parseUnits(minAmount, 18);
      const maxWei = ethers.parseUnits(maxAmount, 18);

      const tx = await contract.createPackage(name, minWei, maxWei, dailyRateBP, baseDuration, referralBonus, closingBonusBP);
      await tx.wait();

      // Refresh packages
      await fetchPackages();

      return true;
    } catch (err: any) {
      console.error('Error creating package:', err);
      throw new Error(err.message || 'Failed to create package');
    }
  }, [signer, getContract, fetchPackages]);

  // Admin: Update package
  const updatePackage = useCallback(async (
    packageId: number,
    name: string,
    minAmount: string,
    maxAmount: string,
    dailyRateBP: number,
    baseDuration: number,
    referralBonus: number,
    closingBonusBP: number,
    active: boolean
  ) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = getContract(true);
      const minWei = ethers.parseUnits(minAmount, 18);
      const maxWei = ethers.parseUnits(maxAmount, 18);

      const tx = await contract.updatePackage(packageId, name, minWei, maxWei, dailyRateBP, baseDuration, referralBonus, closingBonusBP, active);
      await tx.wait();

      // Refresh packages
      await fetchPackages();

      return true;
    } catch (err: any) {
      console.error('Error updating package:', err);
      throw new Error(err.message || 'Failed to update package');
    }
  }, [signer, getContract, fetchPackages]);

  // Admin: Withdraw USDT
  const withdrawUsdt = useCallback(async (amount: string) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = getContract(true);
      const amountWei = ethers.parseUnits(amount, 18);

      const tx = await contract.withdrawUsdt(amountWei);
      await tx.wait();

      // Refresh stats
      await fetchContractStats();

      return true;
    } catch (err: any) {
      console.error('Error withdrawing USDT:', err);
      throw new Error(err.message || 'Failed to withdraw USDT');
    }
  }, [signer, getContract, fetchContractStats]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      await Promise.all([
        fetchPackages(),
        fetchContractStats(),
        walletAddress ? fetchUserStake() : null,
        walletAddress ? fetchReferralStats() : null,
        walletAddress ? fetchPendingRewards() : null,
        walletAddress ? checkIsOwner() : null
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchPackages, fetchContractStats, fetchUserStake, fetchReferralStats, fetchPendingRewards, checkIsOwner, walletAddress]);

  // Initial load
  useEffect(() => {
    if (VAULT_STAKING_CONTRACT_ADDRESS) {
      refresh();
    } else {
      setLoading(false);
      setError('Contract not deployed yet');
    }
  }, [refresh]);

  return {
    packages,
    userStake,
    contractStats,
    referralStats,
    pendingRewards,
    oneDreamPrice,
    isOwner,
    loading,
    error,
    stake,
    claimRewards,
    claimRestakeBonus,
    claimClosingBonus,
    completeStake,
    createPackage,
    updatePackage,
    withdrawUsdt,
    refresh
  };
};
