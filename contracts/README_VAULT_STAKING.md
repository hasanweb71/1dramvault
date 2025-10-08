# OneDream Vault Staking Smart Contract

## 📋 Overview

A comprehensive USDT staking vault that rewards users with 1Dream tokens based on real-time PancakeSwap pricing. Features include referral bonuses, re-staking rewards, and full administrative control.

## ✨ Key Features

### User Features
- **USDT Staking**: Stake USDT in tiered packages (Bronze, Silver, Gold, Diamond)
- **Daily Rewards**: Earn 1Dream tokens daily based on package rate
- **Real-time Pricing**: Rewards calculated using live PancakeSwap 1Dream/USDT price
- **Referral System**: Earn additional staking days for each successful referral
- **Re-staking Bonus**: Get 8% bonus in 1Dream tokens when re-staking
- **No USDT Unstaking**: All USDT remains in contract (permanent liquidity)

### Admin Features
- **Package Management**: Create and update staking packages
- **USDT Withdrawal**: Owner can withdraw collected USDT
- **Price Feed Control**: Update PancakeSwap pair address if needed
- **Full Control**: Comprehensive admin panel for all operations

## 📊 Package Structure

Each package includes:
- **Name**: Package identifier (Bronze, Silver, etc.)
- **Amount Range**: Min/max USDT stake amounts
- **Daily Rate**: Percentage earned per day (1% = 100 basis points)
- **Base Duration**: Standard staking period in days
- **Referral Bonus**: Days added per successful referral
- **Active Status**: Can be enabled/disabled by admin

### Default Packages

| Package | Min | Max | Daily Rate | Duration | Referral Bonus |
|---------|-----|-----|------------|----------|----------------|
| Bronze | $100 | $500 | 1% | 120 days | +4 days |
| Silver | $600 | $1,000 | 1% | 120 days | +8 days |
| Gold | $1,000 | $5,000 | 1% | 120 days | +12 days |
| Diamond | $6,000 | $10,000 | 1% | 120 days | +15 days |

## 🔧 Technical Specifications

### Smart Contract Details

**Contract Name**: `OneDreamVaultStaking`
**Solidity Version**: ^0.8.20
**License**: MIT

**Interfaces Used**:
- IERC20 (USDT and 1Dream tokens)
- IPancakeSwapV2Pair (Price oracle)

**Key Constants**:
- BASIS_POINTS = 10,000 (100% = 10,000 BP)
- RESTAKE_BONUS_BP = 800 (8% = 800 BP)

### State Variables

```solidity
address public owner;                    // Contract owner
IERC20 public usdtToken;                 // USDT token contract
IERC20 public oneDreamToken;             // 1Dream token contract
IPancakeSwapV2Pair public pancakeSwapPair; // Price oracle
uint256 public totalUsdtStaked;          // Total USDT staked
uint256 public totalStakers;             // Unique staker count
uint256 public totalRewardsPaid;         // Total rewards distributed
```

### Core Functions

#### User Functions

**stake(packageId, usdtAmount, referrer)**
- Stakes USDT in specified package
- Records referrer for bonus days
- Emits `Staked` event

**claimRewards()**
- Claims accumulated daily rewards
- Calculates based on current 1Dream price
- Updates lastClaimTime
- Emits `RewardsClaimed` event

**claimRestakeBonus()**
- Claims 8% re-staking bonus
- Only available after staking period ends
- One-time claim per stake
- Emits `RestakeBonusClaimed` event

**completeStake()**
- Marks stake as complete
- Allows user to re-stake
- Must be called after period ends

#### Admin Functions

**createPackage(name, minAmount, maxAmount, dailyRate, baseDuration, referralBonus)**
- Creates new staking package
- Owner only
- Emits `PackageCreated` event

**updatePackage(packageId, ...params, active)**
- Updates existing package
- Can enable/disable packages
- Owner only
- Emits `PackageUpdated` event

**withdrawUsdt(amount)**
- Withdraws USDT from contract
- Owner only
- Emits `UsdtWithdrawn` event

**withdrawOneDream(amount)**
- Emergency withdrawal of 1Dream tokens
- Owner only
- Emits `OneDreamWithdrawn` event

**updatePancakeSwapPair(newPair)**
- Updates price oracle address
- Owner only
- Emits `PancakeSwapPairUpdated` event

#### View Functions

**getOneDreamPrice()** → uint256
- Returns current 1Dream price in USDT
- Fetched from PancakeSwap pair reserves

**calculatePendingRewards(user)** → uint256
- Calculates claimable rewards for user
- Based on time elapsed and current price

**getUserStake(user)** → (multiple)
- Returns complete stake information
- Includes all stake parameters and status

**getActivePackages()** → StakingPackage[]
- Returns all active staking packages
- Used by frontend to display options

**getContractStats()** → (multiple)
- Returns comprehensive contract statistics
- Used for admin dashboard

**getReferralStats(user)** → (count, addresses)
- Returns user's referral information
- List of referred addresses

**canRestake(user)** → bool
- Checks if user can stake again
- True if no active stake or period ended

**getTimeRemaining(user)** → uint256
- Returns seconds until stake period ends
- 0 if no active stake or already ended

## 🔐 Security Features

### Access Control
- Owner-only functions for admin operations
- No way for users to withdraw USDT (by design)
- Only owner can emergency withdraw 1Dream tokens

### Safety Checks
- Amount range validation for packages
- Active stake prevention (one at a time)
- Package active status verification
- Sufficient balance checks before transfers
- Referrer validation (can't refer yourself)

### Price Oracle Safety
- Uses PancakeSwap V2 pair reserves
- Automatic token order detection
- Returns 0 if pair has no liquidity
- Can be updated by owner if needed

## 📱 Frontend Integration

### Required Environment Variables

```env
VITE_VAULT_STAKING_CONTRACT=0xYourContractAddress
```

### React Hook Usage

```typescript
import { useVaultStaking } from '../hooks/useVaultStaking';

const {
  packages,           // Active staking packages
  userStake,          // Current user stake
  contractStats,      // Contract statistics
  referralStats,      // User referral data
  pendingRewards,     // Claimable rewards
  oneDreamPrice,      // Current price
  isOwner,            // Is user contract owner
  loading,            // Loading state
  error,              // Error message
  stake,              // Stake function
  claimRewards,       // Claim function
  claimRestakeBonus,  // Claim bonus function
  completeStake,      // Complete function
  createPackage,      // Admin: create package
  updatePackage,      // Admin: update package
  withdrawUsdt,       // Admin: withdraw USDT
  refresh             // Refresh all data
} = useVaultStaking(walletAddress, signer);
```

### Staking Flow Example

```typescript
// 1. Approve USDT (handled automatically in stake function)
// 2. Stake
await stake(
  packageId,        // 1, 2, 3, or 4
  "100",            // Amount in USDT
  referrerAddress   // Or ethers.ZeroAddress if no referrer
);

// 3. Claim rewards (can be done daily)
await claimRewards();

// 4. After period ends, complete stake
await completeStake();

// 5. Re-stake (gets 8% bonus)
await stake(packageId, amount, referrer);

// 6. After re-stake period, claim bonus
await claimRestakeBonus();
```

## 📈 Economics & Math

### Reward Calculation

```
Daily Reward (in USDT terms) = stakedAmount × dailyRate
Actual Reward (in 1Dream) = dailyReward / current1DreamPrice

Example:
- Staked: 1000 USDT
- Daily Rate: 1% = 0.01
- Daily Reward: 1000 × 0.01 = 10 USDT worth
- If 1Dream Price = $0.005
- Actual Reward: 10 / 0.005 = 2000 1Dream tokens/day
```

### Re-staking Bonus

```
Bonus = stakedAmount × 8%
Converted to 1Dream at end of period

Example:
- Staked: 1000 USDT
- Bonus: 1000 × 0.08 = 80 USDT worth
- If 1Dream Price = $0.005 at claim time
- Bonus: 80 / 0.005 = 16,000 1Dream tokens
```

### Referral System

```
Referrer Benefit: Additional staking days
- Not monetary reward
- Extends earning period
- Staking duration = baseDuration + (referralCount × bonusDays)

Example:
- Base: 120 days
- Referral Bonus: 8 days per referral
- 5 referrals = 120 + (5 × 8) = 160 days total
```

## 🧪 Testing Checklist

Before mainnet deployment:

### Contract Testing
```
✅ Deploy to testnet (BSC Testnet)
✅ Create test packages
✅ Test staking with test USDT
✅ Test reward claims
✅ Test referral system
✅ Test re-staking and bonus
✅ Test admin functions
✅ Test price oracle
✅ Verify all events emit correctly
✅ Test edge cases (zero amounts, etc.)
```

### Security Testing
```
✅ Access control (non-owner can't call admin functions)
✅ No double-staking prevention
✅ Correct math for rewards
✅ Correct math for bonuses
✅ Price manipulation resistance
✅ Reentrancy protection (CEI pattern used)
```

### Frontend Testing
```
✅ Package display correct
✅ Stake flow works end-to-end
✅ Claim rewards works
✅ Admin panel accessible to owner only
✅ Error handling works
✅ Loading states display
```

## 🚨 Known Limitations

1. **No Emergency Pause**: Contract doesn't have pause functionality. To "pause", set all packages to inactive.

2. **No USDT Unstaking**: By design - users cannot withdraw staked USDT. Only rewards are claimable.

3. **One Package at a Time**: Users can only have one active stake. Must complete current before re-staking.

4. **Price Oracle Dependency**: Relies on PancakeSwap pair liquidity. If pair breaks, oracle needs updating.

5. **Gas Costs**: Each claim/stake requires gas. Users need BNB for transactions.

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Daily**:
- Monitor reward pool balance
- Check for unusual activity
- Verify price feed accuracy

**Weekly**:
- Review total staked amounts
- Check referral activity
- Analyze package popularity

**Monthly**:
- Refill reward pool if needed
- Review and optimize packages
- Generate usage reports

### Common Issues

See `QUICK_SETUP_AFTER_DEPLOYMENT.md` for troubleshooting guide.

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

For bugs or improvements:
1. Test on BSC Testnet first
2. Document the issue/improvement
3. Submit with test results

## 📚 Additional Resources

- **Deployment Guide**: `VAULT_DEPLOYMENT_GUIDE.md`
- **Quick Setup**: `QUICK_SETUP_AFTER_DEPLOYMENT.md`
- **Contract ABI**: `OneDreamVaultStaking_ABI.json`
- **Frontend Hook**: `src/hooks/useVaultStaking.ts`
- **Admin Component**: `src/components/VaultAdminPanel.tsx`

---

Built for 1Dream by the development team 🚀
