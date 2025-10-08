# OneDreamStaking V2 - Deployment and Testing Guide

## Overview
This guide covers the complete deployment process for the new OneDreamStaking V2 contract with simplified referral system.

## Key Changes from V1

### Referral System Simplification
- **Removed**: Multi-tier referral system with different commission rates
- **Added**: Single direct referral commission (default 5%, adjustable by admin)
- **New Function**: `setReferralCommission()` - Allows admin to update commission percentage
- **Removed Functions**: All tier management functions (addReferralTier, updateReferralTier, removeReferralTier)

### Reward Distribution
- Contract uses standard ERC20 transfers for rewards
- Admin must ensure contract is funded with sufficient 1DREAM tokens
- Rewards are distributed from contract balance
- Note: 1Dream token has transaction taxes - admin must account for this when funding

## Pre-Deployment Checklist

### 1. Smart Contract Preparation
- [ ] Compile contract using Solidity 0.8.20 or higher
- [ ] Run comprehensive test suite
- [ ] Verify all functions work as expected
- [ ] Check gas optimization

### 2. BSC Testnet Deployment (Recommended First)
- [ ] Get testnet BNB from faucet
- [ ] Deploy to BSC Testnet
- [ ] Verify contract on BSCscan Testnet
- [ ] Test with actual 1DREAM tokens on testnet
- [ ] Test all staking functions
- [ ] Test referral commission updates
- [ ] Test reward claims
- [ ] Test unstaking (both locked and unlocked)

### 3. Mainnet Preparation
- [ ] Ensure owner wallet has sufficient BNB for gas
- [ ] Prepare 1DREAM tokens for initial contract funding
- [ ] Backup current contract state if migrating
- [ ] Prepare user communication about the update

## Deployment Steps

### Step 1: Deploy Contract

```javascript
// Using Hardhat or Truffle
const OneDreamStakingV2 = await ethers.getContractFactory("OneDreamStakingV2");
const staking = await OneDreamStakingV2.deploy(
    "0x0C98F3e79061E0dB9569cd2574d8aac0d5023965" // 1DREAM token address
);
await staking.deployed();

console.log("Contract deployed to:", staking.address);
```

### Step 2: Verify Contract on BSCscan

```bash
npx hardhat verify --network bsc <CONTRACT_ADDRESS> "0x0C98F3e79061E0dB9569cd2574d8aac0d5023965"
```

### Step 3: Initialize Staking Plans

Add the initial staking plans (example):

```javascript
// Flexible Plan - 8% APY, No lock, No fee
await staking.addStakingPlan(
    "Flexible Staking",
    800,  // 8% APY in basis points
    0,    // No lock period
    0,    // No early unstake fee
    ethers.utils.parseEther("100"), // Min 100 1DREAM
    true  // Active
);

// 90 Days Plan - 15% APY, 90 days lock, 12% fee
await staking.addStakingPlan(
    "90 Days Lock",
    1500, // 15% APY
    90 * 24 * 60 * 60, // 90 days in seconds
    1200, // 12% early unstake fee
    ethers.utils.parseEther("500"), // Min 500 1DREAM
    true
);

// 180 Days Plan - 25% APY, 180 days lock, 15% fee
await staking.addStakingPlan(
    "180 Days Lock",
    2500, // 25% APY
    180 * 24 * 60 * 60, // 180 days in seconds
    1500, // 15% early unstake fee
    ethers.utils.parseEther("1000"), // Min 1000 1DREAM
    true
);
```

### Step 4: Fund Contract with Rewards Pool

Calculate initial rewards pool needed:

```javascript
// Example: Fund with 100,000 1DREAM tokens
const fundAmount = ethers.utils.parseEther("100000");

// First approve the contract to spend tokens
await oneDreamToken.approve(staking.address, fundAmount);

// Transfer tokens to contract
await oneDreamToken.transfer(staking.address, fundAmount);

// Verify balance
const balance = await staking.getContractTokenBalance();
console.log("Contract balance:", ethers.utils.formatEther(balance));
```

### Step 5: Set Referral Commission (if not using default 5%)

```javascript
// Default is 500 basis points (5%)
// To change to 3%:
await staking.setReferralCommission(300); // 3% in basis points
```

### Step 6: Update Frontend Configuration

Update the following files with new contract address:

1. **src/hooks/useStakingData.ts**
   - Update `STAKING_CONTRACT_ADDRESS`
   - Update `STAKING_CONTRACT_ABI` with new ABI

2. **src/hooks/useReferralData.ts**
   - Update `STAKING_CONTRACT_ADDRESS`
   - Update `STAKING_CONTRACT_ABI` with new ABI

3. **.env** (if needed)
   - Add new contract address variable if using env vars

## Testing Checklist

### Contract Functions Testing

#### Admin Functions
- [ ] `setReferralCommission()` - Update commission from 5% to 3%, verify event
- [ ] `addStakingPlan()` - Add new plan, verify in array
- [ ] `updateStakingPlan()` - Update existing plan, verify changes
- [ ] `withdrawFunds()` - Emergency withdrawal works
- [ ] `transferOwnership()` - Transfer to new address works

#### User Staking Functions
- [ ] `stake()` - Stake tokens with valid plan
- [ ] `stake()` - Stake tokens with referrer address
- [ ] `stake()` - Verify referral count increments
- [ ] `stake()` - Verify tokens transferred from user
- [ ] `unstake()` - Unstake before lock period (verify fee applied)
- [ ] `unstake()` - Unstake after lock period (no fee)
- [ ] `claimRewards()` - Claim pending rewards
- [ ] `claimReferralBonus()` - Claim bonus as referrer

#### View Functions
- [ ] `calculatePendingReward()` - Returns correct amount
- [ ] `getActiveStakingPlans()` - Returns only active plans
- [ ] `getUserStake()` - Returns correct stake data
- [ ] `getAllUserStakes()` - Returns all stakes for user
- [ ] `getDirectReferralCount()` - Returns correct count
- [ ] `getReferrerTotalEarnings()` - Returns correct earnings
- [ ] `getContractTokenBalance()` - Returns correct balance
- [ ] `getTotalUniqueStakers()` - Returns correct count

### Frontend Integration Testing

#### Dapps Component
- [ ] Wallet connection works
- [ ] Staking plans display correctly
- [ ] Staking form accepts input
- [ ] Token approval flow works
- [ ] Staking transaction succeeds
- [ ] User stakes display correctly
- [ ] Claim rewards button works
- [ ] Unstake button works
- [ ] Referral link generation works
- [ ] Referral commission displays as single percentage (not tiers)
- [ ] Referral bonus claims work

#### Admin Panel
- [ ] Owner verification works
- [ ] Commission update form displays
- [ ] Commission update transaction works
- [ ] Contract balance displays
- [ ] Staking plan management works
- [ ] Tier management section removed
- [ ] No errors in console

### Database Testing
- [ ] Supabase migrations applied successfully
- [ ] Referral data syncs correctly
- [ ] User stats updated properly
- [ ] Referred stakes tracked correctly

## Post-Deployment Monitoring

### First 24 Hours
- Monitor contract events on BSCscan
- Track gas usage for all functions
- Monitor contract token balance
- Verify reward distributions working
- Check for any reverted transactions
- Monitor user feedback channels

### First Week
- Track total staked amount growth
- Monitor referral bonus claims
- Verify commission calculations correct
- Check contract balance remains healthy
- Monitor for any unusual patterns

### Ongoing Maintenance
- Weekly contract balance checks
- Monthly reward pool replenishment (if needed)
- Monitor referral system effectiveness
- Track user engagement metrics

## Common Issues and Solutions

### Issue: Contract Balance Too Low
**Solution**: Admin should call `withdrawFunds()` is not needed here. Instead, transfer more 1DREAM tokens directly to contract address, accounting for transaction taxes.

### Issue: Referral Bonus Claim Fails
**Symptoms**: Transaction reverts when claiming bonus
**Possible Causes**:
- Bonus already claimed (check `referralBonusClaimed` in stake)
- Caller is not the referrer
- Contract has insufficient balance
**Solution**: Check contract balance, verify caller is actual referrer

### Issue: High Gas Costs
**Solution**: This is normal for complex operations. Gas costs are dependent on BSC network congestion.

### Issue: Reward Calculation Seems Wrong
**Possible Cause**: Time elapsed calculation or APY basis points
**Solution**: Verify using `calculatePendingReward()` view function, check timestamps

## Emergency Procedures

### Critical Bug Found
1. Immediately pause new stakes (update all plans to `active = false`)
2. Allow existing users to unstake and claim rewards
3. Use `withdrawFunds()` to recover remaining funds
4. Deploy fixed contract version
5. Communicate with users transparently

### Contract Needs Upgrade
1. Deploy new contract version
2. Set all old contract plans to inactive
3. Allow users to unstake from old contract
4. Migrate reward pool to new contract
5. Update frontend to use new contract
6. Announce migration to users

## Contract Addresses (Update These)

### BSC Mainnet
- **Contract Address**: `TBD - UPDATE AFTER DEPLOYMENT`
- **1DREAM Token**: `0x0C98F3e79061E0dB9569cd2574d8aac0d5023965`
- **Owner Address**: `TBD`

### BSC Testnet
- **Contract Address**: `TBD - UPDATE AFTER DEPLOYMENT`
- **1DREAM Token**: `TBD`
- **Owner Address**: `TBD`

## Support and Contact

For deployment assistance or issues:
- Review this guide thoroughly
- Check BSCscan for transaction details
- Review contract events for debugging
- Consult with development team

## Changelog

### Version 2.0.0 (Current)
- Simplified referral system to direct 5% commission
- Added admin function to adjust referral commission
- Removed multi-tier referral logic
- Improved reward distribution mechanism
- Enhanced contract balance management
- Updated frontend for new structure

### Version 1.0.0 (Previous)
- Original multi-tier referral system
- Fixed commission rates per tier
- Tier-based bonus calculations