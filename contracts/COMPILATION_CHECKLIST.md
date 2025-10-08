# Smart Contract Compilation Checklist

Use this checklist when compiling `OneDreamVaultStaking.sol` in Remix IDE.

## Pre-Compilation Setup

```
✅ Remix IDE opened (remix.ethereum.org)
✅ New file created: OneDreamVaultStaking.sol
✅ Contract code pasted from /contracts/OneDreamVaultStaking.sol
✅ No copy-paste formatting issues
```

## Compiler Configuration

Go to **"Solidity Compiler"** tab (left sidebar) and configure:

```
✅ Compiler Version: 0.8.20 (or higher 0.8.x)
✅ Language: Solidity
✅ EVM Version: default
✅ Enable Optimization: YES (checked)
✅ Optimization Runs: 200
✅ Auto compile: OFF (recommended)
```

### Settings Screenshot Reference
```
┌─────────────────────────────┐
│ SOLIDITY COMPILER           │
├─────────────────────────────┤
│ Compiler: 0.8.20+           │
│ Language: Solidity          │
│ EVM Version: default        │
│                             │
│ ☑ Enable optimization       │
│   Runs: 200                 │
│                             │
│ ☐ Auto compile              │
│                             │
│ [Compile OneDreamVault...] │
└─────────────────────────────┘
```

## Compilation Process

```
✅ Click "Compile OneDreamVaultStaking.sol" button
✅ Wait for compilation (5-10 seconds)
✅ Check output for green checkmark
```

## Expected Results

### Success Indicators
```
✅ Green checkmark appears
✅ Message: "Compilation successful"
✅ No red error messages
✅ No yellow warning messages
✅ Contract appears in dropdown under "Deploy & Run"
```

### What You Should See
```
✓ OneDreamVaultStaking.sol compiled successfully
  │
  ├─ 0 errors
  ├─ 0 warnings
  └─ Ready to deploy
```

## Common Issues & Solutions

### Issue: "Stack too deep" Error
```
❌ Error: CompilerError: Stack too deep

Solution: ✅ Already fixed!
- The contract has been optimized
- Split getUserStake() into 3 functions
- Should NOT appear with the updated contract
```

### Issue: Naming Conflict Warnings
```
⚠️ Warning: This declaration has the same name as another declaration

Solution: ✅ Already fixed!
- All variables renamed from 'stake' to 'userStake'
- Should NOT appear with the updated contract
```

### Issue: Compiler Version Error
```
❌ Error: Source file requires different compiler version

Solution:
- Select compiler version 0.8.20 or higher
- Must be 0.8.x series (not 0.7.x or 0.9.x)
```

### Issue: Optimization Not Enabled
```
⚠️ May cause compilation issues without optimization

Solution:
- Check "Enable optimization" checkbox
- Set runs to 200
- Recompile
```

## Post-Compilation Verification

After successful compilation, verify:

```
✅ Check ABI is generated
   - Click "Compilation Details"
   - Scroll to "ABI" section
   - Should show large JSON array

✅ Check bytecode exists
   - In Compilation Details
   - "Bytecode" section should be populated

✅ Check contract size
   - Should be under 24KB
   - View in "Compilation Details"

✅ Test functions visible
   - Go to "Deploy & Run" tab
   - Contract appears in dropdown
   - Can expand to see functions
```

## Copy ABI

Once compiled successfully:

```
✅ Click "Compilation Details" button
✅ Scroll to "ABI" section
✅ Click copy icon 📋
✅ Paste into OneDreamVaultStaking_ABI.json
✅ Verify JSON is valid (proper brackets)
```

## Deploy & Run Tab Check

Before deploying, verify in "Deploy & Run Transactions" tab:

```
✅ Environment: Injected Provider - MetaMask
✅ Account: Shows your wallet address
✅ Gas limit: Auto (or sufficient amount)
✅ Contract: OneDreamVaultStaking selected
✅ Constructor parameters ready:
   - _usdtToken address
   - _oneDreamToken address
   - _pancakeSwapPair address
```

## Final Checklist Before Deployment

```
✅ Contract compiled with 0 errors, 0 warnings
✅ ABI copied and saved
✅ Constructor parameters prepared
✅ Connected to BSC Mainnet (Chain ID: 56)
✅ Wallet has sufficient BNB for gas (~0.05 BNB)
✅ USDT token address verified
✅ OneDream token address verified
✅ PancakeSwap pair address verified
✅ Owner wallet is the one connected
✅ Ready to deploy!
```

## Compilation Settings Summary

Quick reference:

| Setting | Value |
|---------|-------|
| Compiler | 0.8.20+ |
| Optimization | Enabled |
| Runs | 200 |
| EVM Version | default |
| Language | Solidity |

## Expected Compilation Time

- First compilation: 10-15 seconds
- Subsequent compilations: 5-8 seconds
- With optimization: Slightly longer

## Size Metrics

After compilation, your contract should be:

```
Contract Size: ~20-22 KB
Max allowed: 24 KB (24,576 bytes)
Status: ✅ Within limit
```

## Success Confirmation

You'll know compilation succeeded when:

1. ✅ Green checkmark icon appears
2. ✅ "Compilation successful" message shown
3. ✅ Contract name appears in Deploy tab
4. ✅ No error messages in console
5. ✅ ABI is accessible
6. ✅ Bytecode is generated

## Next Steps

After successful compilation:

1. **Save ABI**: Copy and save to ABI file
2. **Deploy**: Follow deployment guide
3. **Verify**: Submit for verification on BSCScan
4. **Test**: Run basic function tests
5. **Fund**: Transfer OneDream tokens for rewards
6. **Setup**: Create staking packages

---

## Quick Commands for Verification

In browser console (after compilation):

```javascript
// Check compilation status
console.log(remix.call('solidity', 'getCompilationResult'));

// Check contract name
console.log('Contract compiled:', 'OneDreamVaultStaking');
```

---

## Support

If compilation fails after following all steps:

1. Clear Remix cache (Settings > Clear Storage)
2. Refresh browser page
3. Retry compilation
4. Check browser console for errors
5. Verify Solidity version matches

---

**Last Updated**: 2025-10-08
**Contract Version**: 1.0.1
**Status**: Ready for Compilation ✅
