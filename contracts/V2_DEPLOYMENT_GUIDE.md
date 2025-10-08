# OneDreamStaking V2 Deployment Guide

## Smart Contract Deployment Steps

### Prerequisites
1. MetaMask wallet with BNB for gas fees
2. Remix IDE (https://remix.ethereum.org) or Hardhat
3. 1DREAM token contract address on BSC

### Step 1: Deploy Smart Contract

#### Using Remix IDE (Recommended for beginners):

1. **Open Remix IDE**
   - Go to https://remix.ethereum.org

2. **Create New File**
   - Create a new file: `OneDreamStakingV2.sol`
   - Copy the entire contents from `/contracts/OneDreamStakingV2.sol`

3. **Compile Contract**
   - Go to "Solidity Compiler" tab
   - Select compiler version: `0.8.20` or higher
   - Enable optimization (200 runs)
   - Click "Compile OneDreamStakingV2.sol"

4. **Deploy Contract**
   - Go to "Deploy & Run Transactions" tab
   - Select Environment: "Injected Provider - MetaMask"
   - Connect your MetaMask wallet to BSC Mainnet
   - In the constructor parameters, enter your 1DREAM token contract address
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - Wait for confirmation and copy the deployed contract address

5. **Verify Contract on BSCScan** (Optional but recommended)
   - Go to https://bscscan.com
   - Find your deployed contract
   - Click "Verify and Publish"
   - Follow the verification steps

### Step 2: Configure Frontend

1. **Update Contract Address**

   Edit `/src/hooks/useStakingData.ts`:
   ```typescript
   // Line 8-9
   const STAKING_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE';
   ```

   Edit `/src/hooks/useReferralData.ts`:
   ```typescript
   // Line 7-8
   const STAKING_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE';
   ```

   Replace `YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE` with your actual deployed contract address.

2. **Verify Environment Variables**

   Check `/tmp/cc-agent/56298558/project/.env` file has:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Step 3: Initialize Contract (Owner Only)

After deployment, as the contract owner, you need to:

1. **Add Initial Staking Plans**
   - Go to Admin Panel in your application
   - Connect your owner wallet
   - Add staking plans (e.g., Flexible, 90 Days, 180 Days)

2. **Verify Referral Tiers**
   - Contract comes with 3 default tiers:
     - Level 1: 0+ referrals, 5% commission
     - Level 2: 5+ referrals, 7% commission
     - Level 3: 10+ referrals, 10% commission
   - You can add more tiers via Admin Panel if needed

3. **Fund Contract**
   - Transfer 1DREAM tokens to the contract for rewards distribution
   - Use the "Withdraw Funds" function if you need to retrieve tokens

### Step 4: Database Setup

The database migrations are already in place. Verify tables exist:

1. **Check Supabase Tables**
   - `referral_tiers` - Stores referral tier configuration (3 default tiers)
   - `user_referral_stats` - Caches user referral statistics
   - `referred_stakes` - Tracks stakes made by referred users

2. **Verify Default Tiers**
   - The database should have exactly 3 referral tiers:
     - Level 1: 0+ referrals, 5% commission
     - Level 2: 5+ referrals, 7% commission
     - Level 3: 10+ referrals, 10% commission
   - These match the smart contract's default configuration

3. **RLS Policies**
   - All tables have Row Level Security enabled
   - Policies allow users to access only their own data

### Step 5: Build and Deploy Frontend

1. **Build Production Assets**
   ```bash
   npm run build
   ```

2. **Deploy to Hosting**
   - Upload `dist` folder to your web hosting
   - Options: Vercel, Netlify, AWS S3, etc.
   - Ensure environment variables are set in hosting platform

### Step 6: Testing Checklist

Before going live, test the following:

- [ ] Wallet connection works
- [ ] Can view staking plans
- [ ] Can approve 1DREAM tokens
- [ ] Can stake tokens with and without referral code
- [ ] Can claim staking rewards
- [ ] Can unstake tokens
- [ ] Referral link generation works
- [ ] Referral tiers display correctly
- [ ] Admin can add/edit/remove referral tiers
- [ ] Admin can add/edit staking plans
- [ ] Referral bonus claims work properly

### Step 7: Launch

1. **Announce Contract Address**
   - Share the verified contract address on social media
   - Update documentation with contract address

2. **Monitor Initial Activity**
   - Watch for any errors in browser console
   - Monitor contract interactions on BSCScan
   - Check database for proper data caching

## Important Contract Functions

### Owner Functions (Admin Only)

- `addStakingPlan()` - Add new staking plan
- `updateStakingPlan()` - Modify existing plan
- `addReferralTier()` - Add new referral tier
- `updateReferralTier()` - Modify existing tier
- `removeReferralTier()` - Remove a tier
- `withdrawFunds()` - Withdraw tokens from contract

### User Functions

- `stake()` - Stake tokens with optional referral
- `claimRewards()` - Claim staking rewards
- `unstake()` - Unstake tokens
- `claimReferralBonus()` - Claim referral commission

### View Functions

- `getActiveStakingPlans()` - Get all active plans
- `getReferralTierCount()` - Get number of tiers
- `getReferralTier()` - Get specific tier details
- `getUserStakeCount()` - Get user's stake count
- `getAllUserStakes()` - Get all user stakes
- `getDirectReferralCount()` - Get user's referral count
- `getReferrerTotalEarnings()` - Get user's referral earnings

## Dynamic Tier Management

### Adding a New Tier

Via Admin Panel:
1. Navigate to Admin Panel
2. Click "Add Referral Tier"
3. Enter minimum referrals required
4. Enter commission percentage
5. Submit

Via Contract Direct Call:
```javascript
await contract.addReferralTier(
  minReferrals,      // e.g., 20
  commissionBasisPoints  // e.g., 800 for 8%
);
```

### Updating a Tier

```javascript
await contract.updateReferralTier(
  tierIndex,         // 0, 1, 2, etc.
  minReferrals,      // new minimum
  commissionBasisPoints  // new commission
);
```

### Removing a Tier

```javascript
await contract.removeReferralTier(tierIndex);
```

## Troubleshooting

### Contract Errors

- **"Insufficient allowance"**: User needs to approve tokens first
- **"Insufficient contract balance"**: Contract needs more tokens
- **"Invalid plan"**: Plan doesn't exist or is inactive
- **"Below minimum"**: Stake amount below plan minimum

### Frontend Errors

- **"Failed to fetch"**: Check RPC endpoint and network connection
- **"Contract address not set"**: Update placeholder addresses
- **"Database error"**: Check Supabase credentials and RLS policies

## Security Notes

1. **Contract Owner**: Keep the owner wallet secure
2. **Token Approval**: Users only approve what they stake
3. **RLS Policies**: Database access restricted by wallet address
4. **Rate Limiting**: Built-in retry logic prevents RPC rate limits
5. **Tax Handling**: Contract receives full transfer amounts (taxes handled by token)

## Support

For issues or questions:
1. Check console logs in browser developer tools
2. Verify contract address on BSCScan
3. Check Supabase database for data sync issues
4. Review transaction history for failed transactions

## Contract Upgrades

This is a non-upgradeable contract. For future changes:
1. Deploy new contract version
2. Update frontend contract addresses
3. Migrate user data if necessary
4. Announce migration to users

## Conclusion

Your OneDreamStaking V2 is now ready for deployment! The dynamic tier system allows you to adjust the referral program as your project grows, without requiring smart contract redeployment.
