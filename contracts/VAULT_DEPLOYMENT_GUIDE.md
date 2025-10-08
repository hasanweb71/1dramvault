# OneDream Vault Staking - Complete Deployment Guide

## Overview
This smart contract implements a USDT staking vault that rewards users with 1Dream tokens based on real-time PancakeSwap prices.

### Key Features
✅ **USDT Staking** - Users stake USDT and earn 1Dream token rewards
✅ **PancakeSwap Price Integration** - Rewards calculated using live 1Dream price
✅ **Daily Rewards** - Users claim rewards daily based on package rate
✅ **Referral System** - Earn additional staking days for each successful referral
✅ **Re-staking Bonus** - 8% bonus in 1Dream tokens for re-staking
✅ **No USDT Unstaking** - All USDT stays in contract (owner controlled)
✅ **One Package Per Wallet** - Cannot re-stake until current period ends
✅ **Full Admin Control** - Manage packages, referrals, and withdrawals

---

## Contract Addresses Required for Deployment

You will need the following addresses on BSC Mainnet:

1. **USDT Token Address (BSC)**
   `0x55d398326f99059fF775485246999027B3197955`

2. **1Dream Token Address**
   `YOUR_1DREAM_TOKEN_ADDRESS` (replace with actual deployed token)

3. **PancakeSwap V2 Pair Address (1Dream/USDT)**
   You need to create a liquidity pair on PancakeSwap first:
   - Go to PancakeSwap
   - Create 1Dream/USDT pair
   - Add liquidity
   - Get the pair address from BSCScan

---

## Pre-Deployment Checklist

### 1. Create PancakeSwap Liquidity Pair
```
✅ Create 1Dream/USDT pair on PancakeSwap V2
✅ Add initial liquidity (recommended: $10,000+ for accurate pricing)
✅ Get pair contract address from BSCScan
✅ Verify pair is active and trading
```

### 2. Prepare Contract Owner Wallet
```
✅ Have sufficient BNB for deployment gas (~0.05 BNB)
✅ Have 1Dream tokens ready to fund reward pool
✅ Wallet should be secure multisig or hardware wallet
✅ Note down owner address for admin access
```

---

## Deployment Steps

### Step 1: Deploy the Contract

Use Remix, Hardhat, or any Solidity deployment tool.

**Constructor Parameters:**
```solidity
_usdtToken: 0x55d398326f99059fF775485246999027B3197955
_oneDreamToken: YOUR_1DREAM_TOKEN_ADDRESS
_pancakeSwapPair: YOUR_PANCAKESWAP_PAIR_ADDRESS
```

**Example using Remix:**
1. Open Remix IDE
2. Create new file: `OneDreamVaultStaking.sol`
3. Paste contract code
4. Select compiler version: `0.8.20` or higher
5. Compile contract
6. Switch to "Deploy & Run Transactions"
7. Select "Injected Provider - MetaMask"
8. Connect wallet to BSC Mainnet
9. Enter constructor parameters
10. Deploy and confirm transaction

### Step 2: Verify Contract on BSCScan

1. Go to BSCScan
2. Find your deployed contract
3. Click "Contract" > "Verify and Publish"
4. Select:
   - Compiler: `v0.8.20+`
   - Optimization: Yes (200 runs)
   - License: MIT
5. Paste contract source code
6. Verify

### Step 3: Fund Reward Pool

Transfer 1Dream tokens to contract for rewards:

```javascript
// Recommended initial funding: 10,000,000 1Dream tokens
// This depends on your expected staking volume
```

Use the contract address to send 1Dream tokens directly.

### Step 4: Create Initial Staking Packages

Call `createPackage` function for each tier:

#### Bronze Package
```javascript
createPackage(
  "Bronze",                    // name
  100000000000000000000,       // minAmount: 100 USDT (18 decimals)
  500000000000000000000,       // maxAmount: 500 USDT (18 decimals)
  100,                         // dailyRateBasisPoints: 1% (100 BP)
  120,                         // baseDurationDays: 120 days
  4                            // referralBonusDays: 4 days per referral
)
```

#### Silver Package
```javascript
createPackage(
  "Silver",                    // name
  600000000000000000000,       // minAmount: 600 USDT
  1000000000000000000000,      // maxAmount: 1000 USDT
  100,                         // dailyRateBasisPoints: 1%
  120,                         // baseDurationDays: 120 days
  8                            // referralBonusDays: 8 days per referral
)
```

#### Gold Package
```javascript
createPackage(
  "Gold",                      // name
  1000000000000000000000,      // minAmount: 1000 USDT
  5000000000000000000000,      // maxAmount: 5000 USDT
  100,                         // dailyRateBasisPoints: 1%
  120,                         // baseDurationDays: 120 days
  12                           // referralBonusDays: 12 days per referral
)
```

#### Diamond Package
```javascript
createPackage(
  "Diamond",                   // name
  6000000000000000000000,      // minAmount: 6000 USDT
  10000000000000000000000,     // maxAmount: 10000 USDT
  100,                         // dailyRateBasisPoints: 1%
  120,                         // baseDurationDays: 120 days
  15                           // referralBonusDays: 15 days per referral
)
```

**Note:** USDT on BSC uses 18 decimals, so multiply amounts by 10^18

### Step 5: Test Contract Functions

Before going live, test:

```javascript
// 1. Check package was created
getPackage(1) // Should return Bronze package details

// 2. Check price feed works
getOneDreamPrice() // Should return current price from PancakeSwap

// 3. Check contract stats
getContractStats() // Should show 0 stakers, correct balances
```

---

## Frontend Integration

Add contract address to your `.env` file:

```env
VITE_VAULT_STAKING_CONTRACT=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

The frontend will automatically:
- Load packages from contract
- Display real-time stats
- Enable staking functionality
- Show admin panel for contract owner

---

## Admin Functions Guide

### Package Management

**Create Package:**
```solidity
createPackage(name, minAmount, maxAmount, dailyRate, baseDuration, referralBonus)
```

**Update Package:**
```solidity
updatePackage(packageId, name, minAmount, maxAmount, dailyRate, baseDuration, referralBonus, active)
```

**Toggle Package Status:**
```solidity
setPackageActive(packageId, true/false)
```

### Financial Management

**Withdraw USDT (Owner Only):**
```solidity
withdrawUsdt(amount) // Amount in wei (with 18 decimals)
```

**Withdraw 1Dream (Owner Only - Emergency):**
```solidity
withdrawOneDream(amount) // Amount in wei (with token decimals)
```

### Price Feed Management

**Update PancakeSwap Pair (if needed):**
```solidity
updatePancakeSwapPair(newPairAddress)
```

---

## User Flow

### Staking Process

1. **User approves USDT:**
   ```javascript
   await usdtToken.approve(contractAddress, amount)
   ```

2. **User stakes:**
   ```javascript
   await contract.stake(packageId, usdtAmount, referrerAddress)
   ```

3. **User claims rewards daily:**
   ```javascript
   await contract.claimRewards()
   ```

4. **After period ends, complete stake:**
   ```javascript
   await contract.completeStake()
   ```

5. **User can then re-stake (gets 8% bonus):**
   ```javascript
   await contract.stake(packageId, usdtAmount, referrerAddress)
   ```

6. **After re-stake period, claim bonus:**
   ```javascript
   await contract.claimRestakeBonus()
   ```

---

## Security Considerations

### Owner Security
- Use hardware wallet or multisig for owner address
- Never share private keys
- Test all admin functions on testnet first

### Contract Security
- Contract has been audited (recommended before mainnet)
- All USDT deposits are locked until owner withdrawal
- Rewards pool should be monitored and refilled regularly

### Price Oracle Security
- PancakeSwap pair should have sufficient liquidity ($50k+ recommended)
- Monitor for price manipulation
- Consider adding price sanity checks

---

## Monitoring & Maintenance

### Daily Tasks
- Monitor reward pool balance
- Check for stuck transactions
- Verify price feed accuracy

### Weekly Tasks
- Review referral activity
- Check total staked amounts
- Analyze package popularity

### Monthly Tasks
- Refill reward pool if needed
- Review and adjust packages
- Generate usage reports

---

## Troubleshooting

### Common Issues

**Issue: Price returns 0**
- Check PancakeSwap pair has liquidity
- Verify pair address is correct
- Ensure pair is 1Dream/USDT (not other pair)

**Issue: Rewards calculation wrong**
- Check token decimals match (USDT 18, verify 1Dream decimals)
- Verify daily rate basis points (1% = 100 BP)
- Check user's lastClaimTime

**Issue: User can't stake**
- Verify user has approved USDT
- Check user doesn't have active stake
- Verify package is active
- Check amount is within min/max range

**Issue: Admin functions don't work**
- Verify you're calling from owner wallet
- Check wallet is connected to correct network
- Confirm gas limit is sufficient

---

## Support & Updates

For issues or questions:
1. Check contract verified on BSCScan
2. Review transaction logs and events
3. Test on testnet first
4. Contact development team

---

## Deployment Checklist Summary

```
✅ Deploy contract with correct parameters
✅ Verify contract on BSCScan
✅ Fund reward pool with 1Dream tokens
✅ Create 4 staking packages (Bronze, Silver, Gold, Diamond)
✅ Test all functions (staking, claiming, admin)
✅ Update frontend .env with contract address
✅ Verify price feed works
✅ Test admin panel access
✅ Monitor first stakes carefully
✅ Set up ongoing monitoring
```

---

## Contract Address (To Be Added After Deployment)

```
OneDreamVaultStaking: 0x_________________________
```

**Network:** Binance Smart Chain (BSC) Mainnet
**Chain ID:** 56

---

## Gas Estimates

Approximate gas costs on BSC:

- Deploy Contract: ~0.03 BNB
- Create Package: ~0.001 BNB
- User Stake: ~0.002 BNB
- Claim Rewards: ~0.001 BNB
- Withdraw (Admin): ~0.001 BNB

*Prices based on 3 Gwei gas price*

---

## Next Steps After Deployment

1. Add contract address to frontend
2. Test with small amounts first
3. Announce launch to community
4. Monitor closely for first 24 hours
5. Scale up as confidence builds

Good luck with your deployment! 🚀
