# Quick Setup After Contract Deployment

## Step 1: Add Contract Address to Environment

After deploying the contract, add the address to your `.env` file:

```env
VITE_VAULT_STAKING_CONTRACT=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

## Step 2: Fund the Reward Pool

Transfer 1Dream tokens to the contract address for user rewards:

**Recommended Initial Amount:** 1,000,000 - 10,000,000 1Dream tokens

Simply send tokens to the contract address from your wallet or DEX.

## Step 3: Create Staking Packages

Use the admin panel or call the contract directly to create packages.

### Using Admin Panel (Easiest Way):

1. Go to your application
2. Navigate to Admin Panel
3. Connect owner wallet
4. Click "Add Package"
5. Fill in details for each tier:

**Bronze Package:**
- Name: `Bronze`
- Min Amount: `100`
- Max Amount: `500`
- Daily Rate: `1` (%)
- Base Duration: `120` (days)
- Referral Bonus: `4` (days)

**Silver Package:**
- Name: `Silver`
- Min Amount: `600`
- Max Amount: `1000`
- Daily Rate: `1` (%)
- Base Duration: `120` (days)
- Referral Bonus: `8` (days)

**Gold Package:**
- Name: `Gold`
- Min Amount: `1000`
- Max Amount: `5000`
- Daily Rate: `1` (%)
- Base Duration: `120` (days)
- Referral Bonus: `12` (days)

**Diamond Package:**
- Name: `Diamond`
- Min Amount: `6000`
- Max Amount: `10000`
- Daily Rate: `1` (%)
- Base Duration: `120` (days)
- Referral Bonus: `15` (days)

### Using Contract Directly (Advanced):

If admin panel isn't working, use BSCScan:

1. Go to BSCScan > Your Contract > Write Contract
2. Connect wallet
3. Find `createPackage` function
4. For each package, enter:

```solidity
// Bronze
createPackage(
  "Bronze",
  "100000000000000000000",      // 100 USDT (18 decimals)
  "500000000000000000000",      // 500 USDT
  100,                          // 1% daily
  120,                          // 120 days
  4                             // 4 days per referral
)

// Silver
createPackage(
  "Silver",
  "600000000000000000000",
  "1000000000000000000000",
  100,
  120,
  8
)

// Gold
createPackage(
  "Gold",
  "1000000000000000000000",
  "5000000000000000000000",
  100,
  120,
  12
)

// Diamond
createPackage(
  "Diamond",
  "6000000000000000000000",
  "10000000000000000000000",
  100,
  120,
  15
)
```

## Step 4: Verify Everything Works

1. **Check packages are created:**
   - Call `getActivePackages()` on BSCScan Read Contract
   - Or check admin panel

2. **Verify reward pool:**
   - Call `getContractStats()` to see OneDream balance
   - Ensure sufficient tokens for rewards

3. **Test price feed:**
   - Call `getOneDreamPrice()`
   - Should return non-zero value from PancakeSwap

4. **Test with small stake:**
   - Use a test wallet
   - Stake minimum amount ($100 USDT)
   - Verify transaction succeeds
   - Check user can see stake details

## Step 5: Launch Checklist

```
✅ Contract deployed and verified on BSCScan
✅ Contract address added to .env
✅ Reward pool funded with 1Dream tokens
✅ All 4 packages created (Bronze, Silver, Gold, Diamond)
✅ Price feed working (returns valid price)
✅ Test stake completed successfully
✅ Admin panel accessible by owner
✅ User interface displaying packages correctly
✅ Monitoring setup in place
```

## Common Issues & Solutions

### Issue: "Contract not deployed yet" error

**Solution:**
- Ensure `VITE_VAULT_STAKING_CONTRACT` is set in `.env`
- Restart dev server after adding env variable
- Check address is correct (no typos, proper format)

### Issue: Packages not showing

**Solution:**
- Verify packages were created (check BSCScan events)
- Call `getPackageCount()` - should return 4
- Refresh page or click refresh button
- Check browser console for errors

### Issue: Price returns 0

**Solution:**
- Verify PancakeSwap pair has liquidity
- Check pair address is correct in contract
- Ensure pair is 1Dream/USDT (not another pair)
- Add more liquidity if needed ($10k+ recommended)

### Issue: Admin panel shows "Access Denied"

**Solution:**
- Verify you're connected with owner wallet
- Call `owner()` function to confirm owner address
- Check you're on correct network (BSC Mainnet)

### Issue: Staking fails

**Solution:**
- Ensure user has approved USDT first
- Check amount is within package min/max range
- Verify user doesn't have active stake already
- Check package is active
- Ensure sufficient gas

## Monitoring Dashboard

Monitor these metrics regularly:

1. **Contract Balance**
   - USDT: Should increase as users stake
   - 1Dream: Should decrease as rewards claimed
   - Alert if reward pool < 100,000 tokens

2. **User Activity**
   - Total stakers
   - Total staked amount
   - Rewards claimed daily

3. **Package Performance**
   - Which packages are most popular
   - Average stake amount per package
   - Referral activity per package

4. **Price Feed**
   - 1Dream price from PancakeSwap
   - Ensure price is stable and realistic
   - Monitor for manipulation attempts

## Refilling Reward Pool

When reward pool is low:

1. Calculate needed amount based on active stakes
2. Transfer 1Dream tokens to contract address
3. Verify balance updated: `getContractStats()`
4. No contract function needed - just send tokens

## Emergency Procedures

### If price feed breaks:

```solidity
// Update to new PancakeSwap pair
updatePancakeSwapPair(newPairAddress)
```

### If need to pause (no native pause):

- Set all packages to inactive:
```solidity
setPackageActive(1, false)
setPackageActive(2, false)
setPackageActive(3, false)
setPackageActive(4, false)
```

### If need to withdraw USDT:

```solidity
// Withdraw specific amount
withdrawUsdt(amountInWei)

// Example: Withdraw 1000 USDT
withdrawUsdt("1000000000000000000000")
```

## Support Contacts

Keep these handy:
- Contract Address: `[Add after deployment]`
- Owner Wallet: `[Your wallet address]`
- PancakeSwap Pair: `[Pair address]`
- Deployment Date: `[Date]`
- Initial Funding: `[Amount of 1Dream]`

## Next Steps

After successful launch:

1. **Week 1:** Monitor closely, be ready to adjust
2. **Week 2-4:** Analyze user behavior, optimize packages
3. **Month 2:** Consider adding new packages based on demand
4. **Ongoing:** Regular refills, monitoring, community updates

Remember: Users can't unstake USDT - this is by design. Only owner can withdraw USDT from contract.

---

Good luck with your launch! 🚀
