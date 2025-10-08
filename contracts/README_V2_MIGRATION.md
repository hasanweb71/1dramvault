# 1Dream Dapps V2 - Complete Migration Guide

## Executive Summary

This document provides a comprehensive guide for migrating from the multi-tier referral system (V1) to the simplified direct 5% referral commission system (V2).

## What Changed

### Smart Contract Changes

**Removed:**
- Multi-tier referral system with 5 different levels
- `getReferralTier()`, `getReferralTierCount()` functions
- `addReferralTier()`, `updateReferralTier()`, `removeReferralTier()` admin functions
- `referralTiers` array and related tier management logic

**Added:**
- Single `referralCommissionBasisPoints` variable (default: 500 = 5%)
- `setReferralCommission(uint256)` admin function to update commission
- Simplified bonus calculation: `(stakeAmount * referralCommissionBasisPoints) / 10000`
- Direct commission applies to all referrals equally

**Unchanged:**
- All staking functionality
- Reward calculation and distribution
- User stake management
- Direct referral counting
- Emergency withdrawal functions

### Database Changes

**New Tables:**
- `referral_config` - Tracks current and historical commission rates
- View: `current_referral_rate` - Easy access to active rate

**Modified Tables:**
- `referred_stakes` - Added `commission_basis_points_at_stake` column

**Note:** Old `referral_tiers` table remains for historical data but is no longer actively used.

### Frontend Changes Required

**Hooks to Update:**
1. `useStakingData.ts` - Remove tier functions, add commission update function
2. `useReferralData.ts` - Simplify to read single commission rate

**Components to Update:**
1. `Dapps.tsx` - Remove tier display, show single commission
2. `AdminPanel.tsx` - Remove tier management, add commission adjustment
3. Remove tier-related interfaces and types

## Pre-Deployment Steps

### 1. Compile and Test Smart Contract

```bash
cd contracts/
npx hardhat compile
npx hardhat test
```

### 2. Deploy to BSC Testnet First

```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

### 3. Verify on BSCscan Testnet

```bash
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS> "0x0C98F3e79061E0dB9569cd2574d8aac0d5023965"
```

### 4. Test All Functions on Testnet

Use the provided test script or manually test:
- Staking with referral code
- Claiming rewards
- Unstaking (locked and unlocked)
- Referral bonus claims
- Admin functions (commission update)

### 5. Apply Supabase Migrations

```bash
# Apply the new migration
supabase db push

# Or manually apply:
# supabase/migrations/20250930120000_simplify_referral_system_v2.sql
```

### 6. Update Frontend Configuration

**Important: Only update after successful testnet deployment and testing!**

File: `src/hooks/useStakingData.ts`
```typescript
// Line 141: Update contract address
const STAKING_CONTRACT_ADDRESS = 'YOUR_NEW_V2_CONTRACT_ADDRESS';

// Line 146: Replace entire ABI with V2 ABI
const STAKING_CONTRACT_ABI = [ /* Paste from OneDreamStakingV2_ABI.json */ ];
```

File: `src/hooks/useReferralData.ts`
```typescript
// Line 7: Update contract address
const STAKING_CONTRACT_ADDRESS = 'YOUR_NEW_V2_CONTRACT_ADDRESS';

// Line 8: Replace entire ABI with V2 ABI
const STAKING_CONTRACT_ABI = [ /* Paste from OneDreamStakingV2_ABI.json */ ];
```

## Deployment Sequence

### Phase 1: Contract Deployment (1-2 hours)

1. **Deploy V2 Contract to BSC Mainnet**
   ```bash
   npx hardhat run scripts/deploy.js --network bsc
   ```

2. **Verify Contract**
   ```bash
   npx hardhat verify --network bsc <CONTRACT_ADDRESS> "0x0C98F3e79061E0dB9569cd2574d8aac0d5023965"
   ```

3. **Initialize Staking Plans**
   Run initialization script or manually call:
   ```javascript
   // Flexible: 8% APY, No Lock
   await contract.addStakingPlan("Flexible Staking", 800, 0, 0, parseEther("100"), true);

   // 90 Days: 15% APY, 90 days, 12% fee
   await contract.addStakingPlan("90 Days Lock", 1500, 7776000, 1200, parseEther("500"), true);

   // 180 Days: 25% APY, 180 days, 15% fee
   await contract.addStakingPlan("180 Days Lock", 2500, 15552000, 1500, parseEther("1000"), true);
   ```

4. **Fund Contract with Reward Pool**
   ```javascript
   // Example: 100,000 1DREAM
   await oneDreamToken.transfer(contractAddress, parseEther("100000"));
   ```

5. **Verify Commission Rate**
   ```javascript
   const commission = await contract.referralCommissionBasisPoints();
   console.log("Commission:", commission.toString(), "basis points"); // Should be 500 (5%)
   ```

### Phase 2: Database Update (15 minutes)

1. **Backup Current Database** (via Supabase dashboard)

2. **Apply Migration**
   ```bash
   supabase db push
   ```

3. **Verify Migration**
   - Check that `referral_config` table exists
   - Verify default rate (500 basis points) is inserted
   - Check that `current_referral_rate` view works

4. **Update Initial Config**
   ```sql
   -- Optionally update the rate to match contract if different
   SELECT set_current_referral_rate(500, 'admin_address', 'V2 launch - 5% direct commission');
   ```

### Phase 3: Frontend Deployment (30 minutes)

1. **Update Contract Addresses**
   - Update `useStakingData.ts` with new address
   - Update `useReferralData.ts` with new address
   - Replace ABIs with V2 ABI

2. **Remove Tier-Based Logic** (see detailed changes below)

3. **Test Locally**
   ```bash
   npm run dev
   ```
   - Connect wallet
   - Test staking
   - Test referral display
   - Test admin panel (if owner)

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Deploy Frontend**
   - Deploy to your hosting platform
   - Verify production deployment works
   - Test with real wallet on mainnet

### Phase 4: Monitoring (Ongoing)

1. **First Hour**
   - Monitor contract on BSCscan for transactions
   - Watch for any reverted transactions
   - Check error reports from users

2. **First Day**
   - Monitor contract balance
   - Verify referral bonuses being claimed correctly
   - Check database sync is working
   - Gather user feedback

3. **First Week**
   - Weekly contract balance check
   - Review any edge cases or issues
   - Monitor gas costs
   - Track user adoption

## Frontend Code Changes Required

### File: `src/hooks/useStakingData.ts`

**Remove these interface properties/functions:**
```typescript
// Remove from UseStakingDataReturn:
- referralTiers: ReferralTier[]
- addReferralTier
- updateReferralTier
- removeReferralTier

// Remove these interfaces entirely:
- ReferralTier
```

**Add these:**
```typescript
export interface UseStakingDataReturn {
  // ... existing properties ...
  referralCommissionBasisPoints: number; // Current commission from contract
  getReferralCommission: () => Promise<number>;
  setReferralCommission: (commissionBasisPoints: number) => Promise<boolean>; // Admin only
}
```

**Update these functions:**
```typescript
// In fetchStakingData(), remove tier fetching:
- Remove referralTierCount fetch
- Remove tier loop and formattedTiers
- setReferralTiers([]) // Clear tiers

// Add commission fetching:
const commissionBasisPoints = await retryWithBackoff(() => stakingContract.referralCommissionBasisPoints());
// Store and return this value

// In fetchReferredStakesForReferrer(), update bonus calculation:
// OLD:
let commissionBasisPoints = 0;
for (let i = referralTiers.length - 1; i >= 0; i--) {
  if (directReferralCount >= referralTiers[i].minReferrals) {
    commissionBasisPoints = referralTiers[i].commissionBasisPoints;
    break;
  }
}

// NEW:
const commissionBasisPoints = await retryWithBackoff(() => stakingContract.referralCommissionBasisPoints());
```

### File: `src/hooks/useReferralData.ts`

**Simplify fetchReferralTiers:**
```typescript
const fetchReferralTiers = async (): Promise<number> => {
  // Instead of returning array of tiers, return single commission
  const provider = createProvider();
  const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, provider);

  const commission = await retryWithBackoff(() => stakingContract.referralCommissionBasisPoints());
  return Number(commission);
};
```

**Update return type:**
```typescript
export const useReferralData = () => {
  const [referralCommission, setReferralCommission] = useState<number>(500); // Default 5%

  // ... rest of hook ...

  return {
    referralCommission, // Single number instead of array
    // ... other returns ...
  };
};
```

### File: `src/components/Dapps.tsx`

**Remove tier display code:**
```typescript
// DELETE this entire section (around line 798-833):
<div className="space-y-4">
  <h3 className="text-lg font-bold">Commission Tiers</h3>
  {formattedReferralTiers.map((tier, index) => (
    // ... tier display JSX ...
  ))}
</div>
```

**Replace with simple commission display:**
```typescript
<div className="space-y-4">
  <h3 className="text-lg font-bold text-white dark:text-white light:text-gray-900">Referral Commission</h3>
  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
    <div className="flex justify-between items-center mb-2">
      <span className="font-bold text-lg">Direct Referral</span>
      <span className="text-3xl font-bold">{(referralCommission / 100).toFixed(1)}%</span>
    </div>
    <div className="text-sm opacity-90">
      Earn {(referralCommission / 100).toFixed(1)}% commission on every referral's stake
    </div>
  </div>
  <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">
    All referrals earn the same commission rate. No tiers, no complexity!
  </p>
</div>
```

### File: `src/components/AdminPanel.tsx`

**Remove tier management section:**
```typescript
// DELETE entire "Referral Tiers Management" section (around lines 609-676)
// This includes:
- The tier form
- The tier table
- Add/Edit/Remove tier buttons and handlers
```

**Add commission adjustment section:**
```typescript
{/* Referral Commission Management */}
<div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100 mb-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">Referral Commission</h2>
    <Settings className="w-6 h-6 text-blue-600" />
  </div>

  <div className="bg-blue-900/20 dark:bg-blue-900/20 light:bg-blue-50 rounded-xl p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">Current Rate</h3>
        <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">All direct referrals earn this commission</p>
      </div>
      <div className="text-4xl font-bold text-blue-600">
        {(referralCommissionBasisPoints / 100).toFixed(1)}%
      </div>
    </div>
  </div>

  {/* Commission Update Form */}
  <div className="bg-slate-700/30 dark:bg-slate-700/30 light:bg-gray-50 rounded-xl p-6">
    <h4 className="font-medium text-white dark:text-white light:text-gray-900 mb-4">Update Commission Rate</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-700 mb-2">
          New Commission Percentage (0.01% - 10%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0.01"
          max="10"
          value={newCommissionPercentage}
          onChange={(e) => setNewCommissionPercentage(parseFloat(e.target.value))}
          className="w-full px-4 py-3 bg-slate-600/50 dark:bg-slate-600/50 light:bg-white border border-slate-500 dark:border-slate-500 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-xl"
          placeholder="e.g., 5.0"
        />
        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600 mt-2">
          Current: {(referralCommissionBasisPoints / 100).toFixed(1)}% | Entering 5.0 = 5% commission
        </p>
      </div>

      <button
        onClick={handleUpdateCommission}
        disabled={isUpdatingCommission}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
      >
        {isUpdatingCommission ? (
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Updating...</span>
          </div>
        ) : (
          'Update Commission Rate'
        )}
      </button>
    </div>
  </div>
</div>
```

**Add commission update handler:**
```typescript
const [newCommissionPercentage, setNewCommissionPercentage] = useState(5.0);
const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

const handleUpdateCommission = async () => {
  if (newCommissionPercentage < 0.01 || newCommissionPercentage > 10) {
    setSubmitError('Commission must be between 0.01% and 10%');
    return;
  }

  setIsUpdatingCommission(true);
  setSubmitError('');
  setSubmitSuccess('');

  try {
    const commissionBasisPoints = Math.floor(newCommissionPercentage * 100);
    const success = await setReferralCommission(commissionBasisPoints);

    if (success) {
      setSubmitSuccess('Commission rate updated successfully!');
      await refresh(); // Refresh data to show new rate
    } else {
      setSubmitError('Failed to update commission rate');
    }
  } catch (err) {
    setSubmitError('An error occurred while updating commission');
  } finally {
    setIsUpdatingCommission(false);
  }
};
```

## Testing Checklist

### Smart Contract Testing
- [ ] Deploy to testnet successfully
- [ ] Verify contract on BSCscan
- [ ] Stake with referral code
- [ ] Verify referral count increments
- [ ] Calculate and claim referral bonus (should be 5% of stake)
- [ ] Admin updates commission to 3%
- [ ] New stake bonus calculates at 3%
- [ ] Old stake bonus still at 5% (if not claimed yet)
- [ ] Claim rewards works
- [ ] Unstake works (locked and unlocked)
- [ ] Emergency withdraw works

### Frontend Testing
- [ ] Wallet connects successfully
- [ ] Staking plans display correctly
- [ ] Can stake tokens
- [ ] Referral link generates correctly
- [ ] Commission displays as single percentage (not tiers)
- [ ] Referral bonus claims work
- [ ] Admin panel shows commission update form (for owner)
- [ ] Admin can update commission
- [ ] No tier management UI visible
- [ ] No console errors

### Database Testing
- [ ] Migration applies successfully
- [ ] `referral_config` table created
- [ ] Default 500 basis points inserted
- [ ] `current_referral_rate` view returns data
- [ ] `set_current_referral_rate()` function works
- [ ] Existing `referred_stakes` data intact

## Rollback Plan

If critical issues are discovered:

### Immediate Actions
1. **Set all V2 plans to inactive:**
   ```javascript
   // For each plan
   await contractV2.updateStakingPlan(planId, name, apy, lock, fee, minStake, false);
   ```

2. **Announce to users** via all channels

3. **Allow users to unstake from V2**

### Recovery Options

**Option A: Fix and Redeploy**
1. Identify and fix bug
2. Deploy new V2.1 contract
3. Update frontend to use V2.1
4. Allow migration from V2 to V2.1

**Option B: Rollback to V1**
1. Reactivate V1 contract plans
2. Revert frontend to V1 code
3. Revert database to backup
4. Announce rollback to users

## Support and Resources

### Contract Addresses
- **V1 Contract:** `0x2268f30E37841E9cB6d1a1a20354b3eb96F64e1f`
- **V2 Contract:** `TBD - Update after deployment`
- **1DREAM Token:** `0x0C98F3e79061E0dB9569cd2574d8aac0d5023965`

### Key Files
- Smart Contract: `/contracts/OneDreamStakingV2.sol`
- Contract ABI: `/contracts/OneDreamStakingV2_ABI.json`
- Deployment Guide: `/contracts/DEPLOYMENT_GUIDE.md`
- Database Migration: `/supabase/migrations/20250930120000_simplify_referral_system_v2.sql`

### Contact
For deployment support or issues, consult with the development team.

## Changelog

### Version 2.0.0 (Current - Pending Deployment)
- **Breaking Change:** Removed multi-tier referral system
- **Added:** Single direct 5% referral commission (admin adjustable)
- **Added:** `setReferralCommission()` admin function
- **Removed:** All tier management functions
- **Improved:** Simplified bonus calculation
- **Database:** New `referral_config` table for commission tracking
- **Frontend:** Simplified UI, removed tier displays

### Version 1.0.0 (Current Production)
- Multi-tier referral system (5 levels)
- Tier-based commission rates (5% to 15%)
- Automatic tier promotion based on referral count
- Complex bonus calculation logic