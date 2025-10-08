# How to Get the New ABI from Remix

After successfully compiling the fixed contract in Remix IDE, follow these steps to get the new ABI:

## Step 1: Compile the Contract

1. Open Remix IDE
2. Create new file: `OneDreamVaultStaking.sol`
3. Paste the updated contract code
4. Go to "Solidity Compiler" tab (left sidebar)
5. Settings:
   - Compiler: `0.8.20+`
   - Optimization: **Enabled** (200 runs)
6. Click "Compile OneDreamVaultStaking.sol"
7. ✅ Should compile successfully without errors!

## Step 2: Copy the ABI

### Method 1: From Compilation Tab
1. After successful compilation
2. Scroll down in compiler tab
3. Find "Compilation Details" button
4. Click it
5. Find "ABI" section
6. Click the copy icon 📋

### Method 2: From Contract Tab
1. Go to "Deploy & Run Transactions" tab
2. Under "CONTRACT" dropdown
3. Click the small copy icon next to contract name
4. Select "ABI" from the popup

### Method 3: Manual Copy
1. After compilation, look for the "Contract" section
2. Click on "ABI" button
3. The ABI will display in JSON format
4. Select all and copy

## Step 3: Replace the ABI File

1. Open `/contracts/OneDreamVaultStaking_ABI.json`
2. Delete all existing content
3. Paste the new ABI copied from Remix
4. Save the file

## Step 4: Verify the Changes

Check that these new functions exist in the ABI:

```bash
grep "getUserStakeBasic" contracts/OneDreamVaultStaking_ABI.json
grep "getUserStakeDuration" contracts/OneDreamVaultStaking_ABI.json
grep "getUserStakeBonus" contracts/OneDreamVaultStaking_ABI.json
```

All three should return results.

Also verify the old function is gone:
```bash
grep "getUserStake\"" contracts/OneDreamVaultStaking_ABI.json
```

Should only show the three new functions, not the old single `getUserStake`.

## Step 5: Test the Frontend

```bash
npm run dev
```

Connect wallet and check that:
- ✅ Contract stats load
- ✅ Packages display
- ✅ User stake info shows (if user has staked)
- ✅ No console errors

## What Changed in the ABI?

### Removed
```json
{
  "name": "getUserStake",
  "outputs": [
    // 12 return values - caused stack depth error
  ]
}
```

### Added
```json
{
  "name": "getUserStakeBasic",
  "outputs": [
    { "name": "packageId", "type": "uint256" },
    { "name": "usdtAmount", "type": "uint256" },
    { "name": "startTime", "type": "uint256" },
    { "name": "lastClaimTime", "type": "uint256" },
    { "name": "isActive", "type": "bool" }
  ]
},
{
  "name": "getUserStakeDuration",
  "outputs": [
    { "name": "baseDurationDays", "type": "uint256" },
    { "name": "totalDurationDays", "type": "uint256" },
    { "name": "referralCount", "type": "uint256" },
    { "name": "restakeCount", "type": "uint256" }
  ]
},
{
  "name": "getUserStakeBonus",
  "outputs": [
    { "name": "restakeBonus", "type": "uint256" },
    { "name": "restakeBonusClaimed", "type": "bool" },
    { "name": "referrer", "type": "address" }
  ]
}
```

## Quick Alternative: Use TypeChain

If you have TypeChain installed:

```bash
# Generate types from ABI
npx typechain --target ethers-v6 --out-dir src/types contracts/*.json
```

This will auto-generate TypeScript types from your ABI.

## Troubleshooting

**Issue**: Can't find ABI button in Remix
- Solution: Make sure compilation was successful first

**Issue**: ABI looks wrong or incomplete
- Solution: Recompile with optimization enabled

**Issue**: Frontend shows "function not found" errors
- Solution: Clear browser cache and restart dev server

**Issue**: Old ABI still being used
- Solution: Delete `node_modules/.vite` cache folder

## Summary

```
1. ✅ Compile fixed contract in Remix
2. ✅ Copy ABI from Remix
3. ✅ Replace OneDreamVaultStaking_ABI.json
4. ✅ Verify new functions exist
5. ✅ Test frontend integration
```

That's it! Your contract is now ready for deployment with the stack depth issue fixed.

---

**Note**: The React hook has already been updated to work with the 3 new functions, so no frontend code changes are needed beyond replacing the ABI file.
