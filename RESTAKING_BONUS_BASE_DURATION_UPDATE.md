# Re-staking Bonus Base Duration Update

## Overview
Updated the Vault Staking contract and frontend so that the re-staking bonus becomes claimable after the **base duration** (e.g., 120 days) ends, NOT after the total duration (base + referral bonus days).

## Key Change

### Before:
- Re-staking bonus was claimable after `totalDurationDays` (base + referral bonus)
- If user had 120 base days + 8 referral bonus days = 128 total days
- Bonus claimable after 128 days

### After:
- Re-staking bonus is claimable after `baseDurationDays` only
- If user has 120 base days + 8 referral bonus days = 128 total days
- Bonus claimable after **120 days** (base duration)
- User can still stake for the full 128 days, but bonus unlocks at day 120

## Smart Contract Changes

### 1. Updated `claimRestakeBonus()` Function
```solidity
// OLD: Used totalDurationDays
uint256 endTime = userStake.startTime + (userStake.totalDurationDays * 1 days);

// NEW: Uses baseDurationDays
uint256 baseEndTime = userStake.startTime + (userStake.baseDurationDays * 1 days);
require(block.timestamp >= baseEndTime, "Base staking period not ended");
```

### 2. Added New View Functions

**`canClaimRestakeBonus(address _user)`**
- Returns `true` if base duration has ended and bonus not yet claimed
- Checks against `baseDurationDays`, not `totalDurationDays`

**`getBaseTimeRemaining(address _user)`**
- Returns seconds remaining until base duration ends
- Used to show countdown for re-staking bonus eligibility

### 3. Updated Function Documentation
- Clarified that re-staking bonus is claimable after base duration
- Added comments explaining the base vs total duration distinction

## Frontend Changes

### 1. Updated Hook (`useVaultStaking.ts`)

Added new functions:
- `canClaimRestakeBonus()` - Checks if user can claim the bonus
- `getBaseTimeRemaining()` - Gets time until base duration ends

### 2. Updated UI (`Defi.tsx`)

**Your Statistics Section:**
```
Re-staking Bonus: X.XXXX 1DREAM
Claimable after 120 days (base duration)
```

**Package Cards:**
- Changed "120-day duration" to "120-day base duration"
- Changed re-staking bonus description to: "5% bonus after 120 days"

**Re-staking Bonus Card:**
```
Re-staking Bonus
5% of stake amount
Claimable after 120 days
```

## Example Scenario

### User Stakes with Referrals:
1. User stakes in Gold package (120 base days, 5% re-staking bonus)
2. User refers 2 friends (4 bonus days each = +8 days)
3. Total staking period: 128 days (120 base + 8 referral bonus)

### Timeline:
- **Day 0-119**: User earns daily 1% rewards, can claim every 24 hours
- **Day 120**: Re-staking bonus becomes claimable (5% of USDT stake in 1DREAM tokens)
- **Day 120-128**: User continues earning daily 1% rewards (referral bonus period)
- **Day 128**: Staking period ends, user can complete stake and re-stake

### Benefits:
- User gets re-staking bonus earlier (after base duration)
- Referral bonus days extend earning period but don't delay the re-staking bonus
- Encourages users to refer others without penalizing them with delayed bonuses

## Key Points

1. **Daily Rewards**: Still earned for the FULL duration (base + referral bonus)
2. **Re-staking Bonus**: Unlocks at BASE duration (120 days)
3. **Referral Bonus**: Adds extra days for earning daily rewards
4. **Complete Stake**: Still requires TOTAL duration (base + referral) to pass

## Benefits of This Approach

1. **Fair Reward**: Users who refer others get extra earning days without delaying their bonus
2. **Clear Communication**: UI now clearly shows when bonus is claimable
3. **Incentivizes Referrals**: Referral bonus adds earning time without negative effects
4. **Better UX**: Users know exactly when they can claim their re-staking bonus

## Updated Files

**Smart Contract:**
- `contracts/OneDreamVaultStaking.sol`
  - Modified `claimRestakeBonus()` to use `baseDurationDays`
  - Added `canClaimRestakeBonus()` view function
  - Added `getBaseTimeRemaining()` view function

**Frontend:**
- `src/hooks/useVaultStaking.ts`
  - Added `canClaimRestakeBonus()` hook function
  - Added `getBaseTimeRemaining()` hook function

- `src/components/Defi.tsx`
  - Updated statistics display to show bonus timing
  - Updated package features to clarify base duration
  - Updated re-staking bonus card with timing info

**Documentation:**
- `RESTAKING_BONUS_BASE_DURATION_UPDATE.md` (this file)

## Build Status
✅ Application built successfully

## Deployment Notes

⚠️ **Important**: This is a contract-level change. You must:

1. **Redeploy the smart contract** with these changes
2. **Regenerate the ABI** (see `contracts/ABI_UPDATE_REQUIRED.md`)
3. **Update the contract address** in `.env`
4. **Test thoroughly** on testnet before mainnet deployment

## Testing Checklist

- [ ] User can stake successfully
- [ ] Daily rewards claim works (24-hour restriction)
- [ ] Re-staking bonus shows correct timing (base duration)
- [ ] `canClaimRestakeBonus()` returns correct status
- [ ] Bonus becomes claimable after base duration, not total
- [ ] User can still stake for full duration (base + referral)
- [ ] UI shows correct messaging about bonus timing
- [ ] Referral bonus days properly extend earning period
