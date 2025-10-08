# OneDreamStaking V3 Deployment Instructions

## 🎯 What's New in V3

### Key Improvements:
1. **Added `stakeIndex` to `Staked` event** - Now the frontend can accurately track which stake was created
2. **Added `stakeIndex` to `ReferralBonusClaimed` event** - Better tracking of which stakes have been claimed
3. **Changed default referral commission to 10%** (1000 basis points) - Matches your requirement
4. **Added helper functions for referral tracking:**
   - `getClaimableReferralBonuses()` - Returns all unclaimed referral bonuses for a referrer
   - `getTotalClaimableReferralAmount()` - Returns total claimable amount in one call

### Event Changes:

**V2 Staked Event:**
```solidity
event Staked(
    address indexed user,
    uint256 planId,
    uint256 amount,
    uint256 startTime,
    address indexed referrer
);
```

**V3 Staked Event:**
```solidity
event Staked(
    address indexed user,
    uint256 indexed stakeIndex,  // ← NEW
    uint256 planId,
    uint256 amount,
    uint256 startTime,
    address indexed referrer
);
```

**V2 ReferralBonusClaimed Event:**
```solidity
event ReferralBonusClaimed(
    address indexed referrer,
    address indexed staker,
    uint256 bonusAmount
);
```

**V3 ReferralBonusClaimed Event:**
```solidity
event ReferralBonusClaimed(
    address indexed referrer,
    address indexed staker,
    uint256 stakeIndex,  // ← NEW
    uint256 bonusAmount
);
```

## 📋 Deployment Steps

### Step 1: Deploy the Contract

1. **Open Remix IDE:** https://remix.ethereum.org/
2. **Create new file:** `OneDreamStakingV3.sol`
3. **Copy the contract code** from `/contracts/OneDreamStakingV3.sol`
4. **Compile:**
   - Select Solidity version: `0.8.20` or higher
   - Click "Compile OneDreamStakingV3.sol"
5. **Deploy:**
   - Select "Injected Provider - MetaMask" (connect to BSC)
   - Select contract: `OneDreamStakingV3`
   - Constructor parameter: `_oneDreamTokenAddress` = `0x6E6d4973bBA1e7Ae5bA6E2C960c35f2c63699e97`
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - **SAVE THE DEPLOYED CONTRACT ADDRESS**

### Step 2: Setup Staking Plans

After deployment, add your staking plans using the `addStakingPlan` function:

**Example Plans:**

```javascript
// 30 Day Plan - 10% APY
addStakingPlan(
  "30 Day Staking",      // name
  1000,                  // 10% APY (1000 basis points)
  2592000,               // 30 days in seconds
  1000,                  // 10% early unstake fee
  100000000000000000000, // 100 tokens minimum (with 18 decimals)
  true                   // active
)

// 90 Day Plan - 25% APY
addStakingPlan(
  "90 Day Staking",      // name
  2500,                  // 25% APY (2500 basis points)
  7776000,               // 90 days in seconds
  1500,                  // 15% early unstake fee
  100000000000000000000, // 100 tokens minimum
  true                   // active
)

// 180 Day Plan - 50% APY
addStakingPlan(
  "180 Day Staking",     // name
  5000,                  // 50% APY (5000 basis points)
  15552000,              // 180 days in seconds
  2000,                  // 20% early unstake fee
  100000000000000000000, // 100 tokens minimum
  true                   // active
)
```

### Step 3: Fund the Contract

Transfer 1DREAM tokens to the contract address to cover:
- Staking rewards (APY payouts)
- Referral bonuses (10% of each stake)

**Recommended initial funding:**
- At least 20-30% of expected total staked amount
- Example: If expecting 100,000 tokens staked, fund with 25,000+ tokens

### Step 4: Verify the Contract (Optional but Recommended)

On BSCScan:
1. Go to your contract address
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Fill in:
   - Compiler: v0.8.20+
   - License: MIT
   - Optimization: No
   - Contract code: Copy from OneDreamStakingV3.sol
   - Constructor arguments: ABI-encode your token address

## 🔧 After Deployment - Update Frontend

Once deployed, provide me with:

1. **New Contract Address:** `0x...`
2. **Transaction Hash:** The deployment transaction hash

I will then update the frontend to:
1. Use the new V3 contract address
2. Use the new V3 ABI (with updated events)
3. Update the referral tracking to use the new `stakeIndex` from events
4. Simplify the code since V3 has better tracking

## ✅ Testing Checklist

After deployment and frontend update:

- [ ] Connect wallet
- [ ] View staking plans
- [ ] Stake with referral link
- [ ] Verify referral count increases
- [ ] Verify claimable amount shows (10% of stake)
- [ ] Claim referral bonus
- [ ] Verify "Already Claimed" shows after claiming
- [ ] Test unstaking
- [ ] Test rewards claiming

## 🎁 Benefits of V3

### For Users:
- ✅ Accurate referral tracking
- ✅ 10% referral bonus (increased from 5%)
- ✅ No more missing stakes or incorrect claim status
- ✅ Faster frontend loading (less event processing needed)

### For Frontend:
- ✅ `stakeIndex` in events = no need to calculate it
- ✅ New helper functions reduce blockchain calls
- ✅ More reliable claim status tracking
- ✅ Simpler code = fewer bugs

## 📝 Important Notes

1. **All V2 data stays on V2 contract** - Users with stakes in V2 should claim/unstake from V2 first
2. **V3 is a fresh start** - No migration needed, users just stake on new contract
3. **Default commission is 10%** - Can be adjusted by owner using `setReferralCommission()`
4. **All events are backward compatible** - Only added fields, didn't remove any

## 🆘 Support

If you encounter any issues during deployment:
1. Check that you're on BSC Mainnet
2. Ensure you have BNB for gas fees
3. Verify the token address is correct
4. Make sure Remix is using Solidity 0.8.20+

After deployment, send me:
- Contract address
- Network (BSC Mainnet)
- Any error messages if issues occur

I'll update the frontend to work with V3!
