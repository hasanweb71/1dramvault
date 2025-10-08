# 🚀 Quick Start Deployment Guide

## Overview
This is a condensed step-by-step guide to deploy the 1Dream Dapps V2 system. For detailed information, see `README_V2_MIGRATION.md` and `DEPLOYMENT_GUIDE.md`.

---

## ⚡ Prerequisites

- [ ] Node.js installed
- [ ] Hardhat or Truffle set up
- [ ] BSC wallet with BNB for gas
- [ ] 1DREAM tokens for reward pool (100,000+ recommended)
- [ ] Access to Supabase dashboard

---

## 📋 Step-by-Step Deployment

### Step 1: Deploy Smart Contract (30 min)

```bash
# Navigate to contracts directory
cd contracts/

# Compile contract
npx hardhat compile

# Deploy to BSC TESTNET first
npx hardhat run scripts/deploy.js --network bscTestnet

# Save the contract address: ________________

# Verify on BSCscan Testnet
npx hardhat verify --network bscTestnet YOUR_CONTRACT_ADDRESS "0x0C98F3e79061E0dB9569cd2574d8aac0d5023965"

# Test thoroughly on testnet (see testing checklist below)

# If testnet works, deploy to BSC MAINNET
npx hardhat run scripts/deploy.js --network bsc

# Save the contract address: ________________

# Verify on BSCscan Mainnet
npx hardhat verify --network bsc YOUR_CONTRACT_ADDRESS "0x0C98F3e79061E0dB9569cd2574d8aac0d5023965"
```

**Contract Address (Update after deployment):**
```
Testnet: _________________________________
Mainnet: _________________________________
```

### Step 2: Initialize Contract (15 min)

```javascript
// Using Hardhat console or script

// 1. Add Flexible Plan (8% APY, No Lock)
await contract.addStakingPlan(
    "Flexible Staking",
    800,  // 8% APY in basis points
    0,    // No lock period
    0,    // No early fee
    ethers.parseEther("100"), // Min 100 1DREAM
    true  // Active
);

// 2. Add 90 Days Plan (15% APY, 90 days, 12% fee)
await contract.addStakingPlan(
    "90 Days Lock",
    1500,
    7776000,  // 90 days in seconds
    1200,     // 12% fee
    ethers.parseEther("500"),
    true
);

// 3. Add 180 Days Plan (25% APY, 180 days, 15% fee)
await contract.addStakingPlan(
    "180 Days Lock",
    2500,
    15552000, // 180 days in seconds
    1500,     // 15% fee
    ethers.parseEther("1000"),
    true
);

// 4. Fund Contract with 1DREAM tokens
// Transfer tokens to contract address
await oneDreamToken.transfer(
    contractAddress,
    ethers.parseEther("100000") // 100k tokens
);

// 5. Verify Contract State
console.log("Plans:", await contract.getStakingPlanCount());
console.log("Balance:", await contract.getContractTokenBalance());
console.log("Commission:", await contract.referralCommissionBasisPoints()); // Should be 500
```

### Step 3: Update Frontend Configuration (10 min)

**File: `src/hooks/useStakingData.ts`**

```typescript
// Line ~141: Update this address
const STAKING_CONTRACT_ADDRESS = 'YOUR_NEW_V2_CONTRACT_ADDRESS_HERE';

// Line ~146: Replace entire ABI with contents from:
// contracts/OneDreamStakingV2_ABI.json
const STAKING_CONTRACT_ABI = [ /* paste ABI here */ ];
```

**File: `src/hooks/useReferralData.ts`**

```typescript
// Line ~7: Update this address
const STAKING_CONTRACT_ADDRESS = 'YOUR_NEW_V2_CONTRACT_ADDRESS_HERE';

// Line ~8: Replace entire ABI with contents from:
// contracts/OneDreamStakingV2_ABI.json
const STAKING_CONTRACT_ABI = [ /* paste ABI here */ ];
```

### Step 4: Apply Database Migration (5 min)

```bash
# Backup database first (via Supabase dashboard)

# Apply migration
supabase db push

# Or manually via SQL editor in Supabase dashboard:
# Paste contents of: supabase/migrations/20250930120000_simplify_referral_system_v2.sql
# Run the SQL

# Verify in Supabase dashboard:
# - Table "referral_config" exists
# - Default rate (500) is inserted
# - View "current_referral_rate" shows data
```

### Step 5: Build and Deploy Frontend (10 min)

```bash
# Test locally first
npm run dev
# Visit http://localhost:5173
# Test: wallet connect, staking, referral display

# If local test works, build for production
npm run build

# Deploy dist/ folder to your hosting
# (Vercel, Netlify, AWS, etc.)
```

### Step 6: Verify Production (15 min)

Visit your production URL and test:

- [ ] Wallet connects successfully
- [ ] Staking plans show correctly
- [ ] Can approve and stake tokens
- [ ] Referral link generates
- [ ] Commission shows as single percentage (e.g., "5%")
- [ ] Admin panel accessible for owner
- [ ] No console errors

---

## 🧪 Quick Testing Checklist

### Contract Tests (Do on Testnet First!)

- [ ] Stake 100 tokens (Flexible plan)
- [ ] Verify stake appears in user stakes
- [ ] Wait 1 minute, claim small reward
- [ ] Unstake (should work, no fee for Flexible)
- [ ] Stake with referral address
- [ ] Verify referral count increased
- [ ] Claim referral bonus (5% of staked amount)
- [ ] Update commission as admin (e.g., to 3%)
- [ ] Verify new stakes use new commission

### Frontend Tests

- [ ] Connect MetaMask/wallet
- [ ] Select staking plan
- [ ] Approve tokens
- [ ] Stake successfully
- [ ] View my stakes
- [ ] Claim rewards
- [ ] Claim referral bonus
- [ ] Admin: Update commission
- [ ] No errors in browser console

---

## 🔥 Production Readiness Checklist

### Before Going Live

- [ ] Contract deployed to BSC mainnet
- [ ] Contract verified on BSCscan
- [ ] 3 staking plans added and active
- [ ] Contract funded with 100,000+ 1DREAM tokens
- [ ] Commission rate confirmed at 500 (5%)
- [ ] Database migration applied successfully
- [ ] Frontend updated with new contract address
- [ ] Frontend built successfully (`npm run build`)
- [ ] Production deployment tested
- [ ] Admin wallet has owner access
- [ ] All test cases passed

### Post-Launch Monitoring

#### First Hour
- [ ] Monitor BSCscan for transactions
- [ ] Check for reverted transactions
- [ ] Verify first stakes work
- [ ] Check first referral bonus claim

#### First Day
- [ ] Contract balance check
- [ ] User feedback collection
- [ ] Error log review
- [ ] Transaction success rate

#### First Week
- [ ] Weekly balance check
- [ ] Refill contract if needed (account for 5-10% tax)
- [ ] User adoption metrics
- [ ] Any issues or bugs found

---

## 📊 Key Metrics to Track

```
Total Staked: ___________
Unique Stakers: ___________
Referral Bonuses Claimed: ___________
Contract Balance Remaining: ___________
Average Gas Cost: ___________
```

---

## 🆘 Emergency Contacts & Resources

### Contract Addresses
- **1DREAM Token:** `0x0C98F3e79061E0dB9569cd2574d8aac0d5023965`
- **V2 Contract:** `_________________` (update)

### Links
- BSCscan: https://bscscan.com
- Supabase Dashboard: (your project URL)
- Documentation: See `IMPLEMENTATION_COMPLETE.md`

### Emergency Actions

**If critical bug found:**
1. Set all plans to `active = false` immediately
2. Allow users to unstake
3. Use `withdrawFunds()` to recover tokens
4. Announce issue transparently
5. Deploy fixed version

**If contract balance low:**
1. Calculate needed rewards
2. Add 10% extra for taxes
3. Transfer to contract address
4. Verify balance increased

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Users can stake tokens
- ✅ Users receive correct rewards
- ✅ Referral bonuses calculate correctly (5%)
- ✅ Admin can update commission
- ✅ No reverted transactions
- ✅ No errors in frontend
- ✅ Contract balance sufficient

---

## 📝 Deployment Log

**Date:** _______________

**Deployed by:** _______________

**Testnet Contract:** _______________

**Mainnet Contract:** _______________

**Initial Funding:** _______________

**Commission Rate:** _____ % (default 5%)

**Plans Added:**
- [ ] Flexible (8% APY)
- [ ] 90 Days (15% APY)
- [ ] 180 Days (25% APY)

**Issues Encountered:**
_______________________________________
_______________________________________

**Resolution:**
_______________________________________
_______________________________________

**Deployment Time:** ______ hours

**Status:** 🟢 Success / 🟡 Partial / 🔴 Failed

---

## 🎯 Next Steps After Deployment

1. **Announce V2 Launch**
   - Social media posts
   - Community updates
   - Email to users

2. **Monitor Closely**
   - First 24 hours critical
   - Check BSCscan frequently
   - Respond to user questions

3. **Gather Feedback**
   - User experience
   - Any confusions
   - Feature requests

4. **Plan V1 Sunset** (if applicable)
   - Give users 30-60 days
   - Gradually migrate users
   - Eventually disable V1

---

## 💡 Pro Tips

1. **Always test on testnet first** - Save yourself stress and money
2. **Fund extra for taxes** - 1DREAM has transaction fees, plan accordingly
3. **Monitor balance weekly** - Don't let contract run out of tokens
4. **Keep admin private key VERY safe** - It controls everything
5. **Document everything** - Future you will thank current you

---

## 🎉 You're Ready!

Follow these steps in order, test thoroughly, and you'll have a successful V2 deployment.

**Estimated Total Time:** 2-4 hours

**Good luck! 🚀**

---

**Need detailed info?** See:
- `IMPLEMENTATION_COMPLETE.md` - Full overview
- `README_V2_MIGRATION.md` - Complete migration guide
- `DEPLOYMENT_GUIDE.md` - Detailed deployment steps