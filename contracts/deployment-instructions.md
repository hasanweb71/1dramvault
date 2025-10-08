# 🚀 Deployment Instructions for OneDreamStaking V2

## Contract Deployment Complete ✅

Since you've already deployed the contract, follow these steps to complete the setup:

## Step 1: Update Contract Address in Frontend

**CRITICAL**: You must update the contract address in two files:

### File 1: `src/hooks/useStakingData.ts`
```typescript
// Line 141: Replace with your deployed contract address
const STAKING_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE';
```

### File 2: `src/hooks/useReferralData.ts`
```typescript
// Line 7: Replace with your deployed contract address
const STAKING_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE';
```

## Step 2: Initialize Staking Plans

After deployment, you need to add the 3 staking plans. Use these exact parameters:

### Plan 1: Flexible Staking
```javascript
await contract.addStakingPlan(
    "Flexible Staking",
    600,  // 6% APY (600 basis points)
    0,    // No lock period
    0,    // No early unstake fee
    ethers.parseEther("100"), // Min 100 1DREAM
    true  // Active
);
```

### Plan 2: 90 Days Lock
```javascript
await contract.addStakingPlan(
    "90 Days Lock",
    2500, // 25% APY (2500 basis points)
    7776000, // 90 days in seconds (90 * 24 * 60 * 60)
    1200, // 12% early unstake fee (1200 basis points)
    ethers.parseEther("100"), // Min 100 1DREAM
    true  // Active
);
```

### Plan 3: 180 Days Lock
```javascript
await contract.addStakingPlan(
    "180 Days Lock",
    3800, // 38% APY (3800 basis points)
    15552000, // 180 days in seconds (180 * 24 * 60 * 60)
    1200, // 12% early unstake fee (1200 basis points)
    ethers.parseEther("100"), // Min 100 1DREAM
    true  // Active
);
```

## Step 3: Fund Contract with Reward Pool

**IMPORTANT**: Account for 1DREAM token transaction taxes when funding!

```javascript
// Example: If you want 100,000 1DREAM in the contract
// And 1DREAM has 4% transaction tax
// You need to send: 100,000 / (1 - 0.04) = 104,167 tokens

const fundingAmount = ethers.parseEther("104167"); // Adjust based on your needs
await oneDreamToken.transfer(contractAddress, fundingAmount);

// Verify contract balance
const balance = await contract.getContractTokenBalance();
console.log("Contract balance:", ethers.formatEther(balance));
```

## Step 4: Verify Contract Setup

Check that everything is configured correctly:

```javascript
// Check plans
const plans = await contract.getActiveStakingPlans();
console.log("Active plans:", plans.length); // Should be 3

// Check commission
const commission = await contract.referralCommissionBasisPoints();
console.log("Commission:", commission.toString()); // Should be 500 (5%)

// Check balance
const balance = await contract.getContractTokenBalance();
console.log("Contract balance:", ethers.formatEther(balance));
```

## Step 5: Test Frontend Integration

1. **Update Contract Addresses**: Replace placeholder addresses in both hooks
2. **Start Development Server**: `npm run dev`
3. **Test Wallet Connection**: Connect your wallet
4. **Test Staking Plans**: Verify all 3 plans display correctly
5. **Test Staking Flow**: Approve and stake tokens
6. **Test Referral System**: Generate referral link, verify commission shows as single percentage
7. **Test Admin Panel**: If you're the owner, verify commission update form works

## Step 6: Production Deployment

Once everything works locally:

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting platform
```

## Expected Plan Display

After setup, your staking plans should show:

| Plan | APY | Lock Period | Min Stake | Early Fee |
|------|-----|-------------|-----------|-----------|
| Flexible Staking | 6% | No Lock | 100 1DREAM | N/A |
| 90 Days Lock | 25% | 90 Days | 100 1DREAM | 12% |
| 180 Days Lock | 38% | 180 Days | 100 1DREAM | 12% |

## Troubleshooting

### Issue: "Contract not found" error
**Solution**: Verify you've updated both hook files with the correct contract address

### Issue: Plans not displaying
**Solution**: Ensure you've added the 3 staking plans using the exact parameters above

### Issue: Referral commission shows 0%
**Solution**: Check that `referralCommissionBasisPoints` is set to 500 in the contract

### Issue: Contract balance shows 0
**Solution**: Fund the contract with 1DREAM tokens, accounting for transaction taxes

## Next Steps

1. ✅ Deploy contract (DONE)
2. 🔄 Update frontend contract addresses (DO THIS NOW)
3. 🔄 Initialize staking plans (DO THIS NOW)
4. 🔄 Fund contract with reward pool
5. 🔄 Test all functionality
6. 🔄 Deploy to production

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify contract address is correct in both hook files
3. Ensure contract is properly initialized with plans
4. Verify contract has sufficient token balance

Your V2 contract is ready to go! 🎉