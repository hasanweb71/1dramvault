# 🚨 V3 Contract Setup Required

## Current Issue

Your V3 contract is deployed but **has NO staking plans configured**. This is why:
- Claimable shows 0.00
- No referral bonuses section appears
- No stakes can be created

## Required Steps to Activate V3

### Step 1: Add Staking Plans

You MUST call `addStakingPlan` on the V3 contract to create staking plans.

**Using Remix IDE or BSCScan:**

Go to: https://bscscan.com/address/0xded53d0b2dd7be3c30243e97b65b8a6647c61108#writeContract

**Plan 1 - Flexible Staking (6% APY):**
```
addStakingPlan(
  "Flexible Staking",    // name
  600,                   // 6% APY (600 basis points)
  0,                     // No lock (0 seconds)
  0,                     // No early unstake fee
  100000000000000000000, // 100 tokens minimum (100 * 10^18)
  true                   // active
)
```

**Plan 2 - 90 Days Lock (25% APY):**
```
addStakingPlan(
  "90 Days Lock",
  2500,                  // 25% APY
  7776000,               // 90 days (90 * 24 * 60 * 60)
  1200,                  // 12% early unstake fee
  100000000000000000000, // 100 tokens minimum
  true
)
```

**Plan 3 - 180 Days Lock (38% APY):**
```
addStakingPlan(
  "180 Days Lock",
  3800,                  // 38% APY
  15552000,              // 180 days (180 * 24 * 60 * 60)
  1200,                  // 12% early unstake fee
  100000000000000000000, // 100 tokens minimum
  true
)
```

### Step 2: Fund the Contract

Transfer 1DREAM tokens to the contract for rewards:
```
Send to: 0xded53d0b2dd7be3c30243e97b65b8a6647c61108
Amount: Recommended 20-30% of expected stakes
```

### Step 3: Test

1. Refresh the Dapps page
2. You should see 3 staking plans
3. Try staking with a referral link
4. Verify referral tracking works

---

## Alternative: Revert to V2 Temporarily

If you want to keep using the app while setting up V3, I can temporarily revert to V2.
