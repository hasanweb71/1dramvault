# ABI Update Required

The smart contract `OneDreamVaultStaking.sol` has been updated with significant changes. You MUST regenerate the ABI file after deploying the new contract.

## Changes Made to Contract:

1. **Renamed "Closing Bonus" to "Re-staking Bonus"**
   - Changed `closingBonusBasisPoints` to `restakingBonusBasisPoints` in StakingPackage struct
   - Changed `closingBonus` and `closingBonusClaimed` fields removed from UserStake struct
   - Removed `claimClosingBonus()` function
   - Removed `ClosingBonusClaimed` event
   - Updated all related functions to use re-staking bonus terminology

2. **Added Package Name to User Stake View**
   - `getUserStakeBasic()` now returns package name as 6th parameter

3. **Fixed Rewards Calculation**
   - Rewards properly calculate 1% daily in 1DREAM tokens based on current PancakeSwap price
   - Formula: (USDT staked × daily rate × days elapsed) / 1DREAM price

4. **Added 24-Hour Claim Cooldown**
   - `claimRewards()` now enforces 24-hour wait between claims
   - Check: `block.timestamp >= userStake.lastClaimTime + 1 days`

5. **Updated Re-staking Bonus Logic**
   - Bonus now uses package's `restakingBonusBasisPoints` instead of hardcoded 8%
   - Claimable after staking period ends

## How to Update ABI:

### Option 1: Using Remix IDE
1. Open [Remix IDE](https://remix.ethereum.org/)
2. Copy the updated `OneDreamVaultStaking.sol` contract
3. Compile with Solidity ^0.8.20
4. After compilation, go to the "Solidity Compiler" tab
5. At the bottom, click "ABI" button to copy the ABI
6. Replace the contents of `OneDreamVaultStaking_ABI.json` with the copied ABI

### Option 2: Using Hardhat/Truffle
```bash
# If using Hardhat
npx hardhat compile
# ABI will be in artifacts/contracts/OneDreamVaultStaking.sol/OneDreamVaultStaking.json

# If using Truffle
truffle compile
# ABI will be in build/contracts/OneDreamVaultStaking.json
```

Then copy the "abi" array to `OneDreamVaultStaking_ABI.json`

## Important Notes:

- The contract is NOT backward compatible with the old ABI
- You must redeploy the contract with the new code
- Update `.env` with the new contract address: `VITE_VAULT_STAKING_CONTRACT=<new_address>`
- All existing stakes on the old contract will remain on the old contract
- Consider a migration strategy if there are active users

## Frontend Already Updated

The frontend code in `src/hooks/useVaultStaking.ts` and `src/components/Defi.tsx` has been updated to match the new contract interface.
