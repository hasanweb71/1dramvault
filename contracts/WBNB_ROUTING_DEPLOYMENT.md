# Vault Staking Deployment with WBNB Price Routing

## Overview

The contract now supports **price routing through WBNB** instead of requiring a direct 1DREAM/USDT pair. This allows you to use your existing 1DREAM/WBNB liquidity pool.

## How Price Routing Works

```
1DREAM Price in USDT = (1DREAM → WBNB) × (WBNB → USDT)
```

**Example:**
- 1 1DREAM = 0.0001 WBNB (from 1DREAM/WBNB pair)
- 1 WBNB = 600 USDT (from WBNB/USDT pair)
- **Result:** 1 1DREAM = 0.06 USDT

## Required Addresses for Deployment

### 1. USDT Token
```
Address: 0x55d398326f99059fF775485246999027B3197955
Network: BSC Mainnet
```

### 2. Your 1DREAM Token
```
Address: [YOUR_1DREAM_TOKEN_ADDRESS]
Network: BSC Mainnet
```

### 3. 1DREAM/WBNB PancakeSwap Pair
```
Address: [YOUR_EXISTING_1DREAM_WBNB_PAIR]
Network: BSC Mainnet
Note: You already have this pair with liquidity
```

### 4. WBNB/USDT PancakeSwap Pair
```
Address: 0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE
Network: BSC Mainnet
Liquidity: ~$500M (Official PancakeSwap pair)
```

## Constructor Parameters

When deploying the contract, you need **4 parameters**:

```solidity
constructor(
    address _usdtToken,      // 0x55d398326f99059fF775485246999027B3197955
    address _oneDreamToken,  // YOUR_1DREAM_TOKEN_ADDRESS
    address _pancakeSwapPair,    // YOUR_1DREAM_WBNB_PAIR_ADDRESS
    address _wbnbUsdtPair    // 0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE
)
```

## Deployment Steps

### Step 1: Get Your 1DREAM/WBNB Pair Address

Since you already have a 1DREAM/WBNB pair on PancakeSwap, find the address:

**Method 1: From PancakeSwap Interface**
1. Go to https://pancakeswap.finance/liquidity
2. Connect your wallet
3. Find your 1DREAM/WBNB LP position
4. Click "Manage" → The pair address is shown in the URL or contract info

**Method 2: Using BSCScan**
1. Go to PancakeSwap V2 Factory: https://bscscan.com/address/0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73
2. Click "Read Contract"
3. Find `getPair` function
4. Enter:
   - tokenA: Your 1DREAM address
   - tokenB: `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` (WBNB)
5. Click "Query" → Result is your pair address

### Step 2: Deploy Contract Using Remix

1. **Open Remix IDE**: https://remix.ethereum.org
2. **Create new file**: `OneDreamVaultStaking.sol`
3. **Copy contract code** from `OneDreamVaultStaking.sol`
4. **Compile**:
   - Compiler: 0.8.20
   - Optimization: Enabled (200 runs)
5. **Deploy**:
   - Environment: Injected Provider - MetaMask
   - Network: BSC Mainnet
   - Constructor parameters:
     ```
     _usdtToken: 0x55d398326f99059fF775485246999027B3197955
     _oneDreamToken: [YOUR_1DREAM_ADDRESS]
     _pancakeSwapPair: [YOUR_1DREAM_WBNB_PAIR]
     _wbnbUsdtPair: 0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE
     ```
6. **Confirm transaction** in MetaMask

### Step 3: Verify Contract on BSCScan

1. Go to BSCScan
2. Find your deployed contract
3. Click "Verify and Publish"
4. Enter:
   - Compiler: v0.8.20
   - Optimization: Yes (200 runs)
   - Constructor arguments: (auto-filled)
5. Submit

### Step 4: Fund and Setup

1. **Transfer 1DREAM tokens** to contract for rewards
2. **Create packages** (Bronze, Silver, Gold, Diamond)
3. **Test price feed**:
   - Call `getOneDreamPrice()`
   - Should return current price in USDT

## Advantages of WBNB Routing

✅ **No Additional Liquidity Required** - Uses existing 1DREAM/WBNB pool
✅ **Accurate Pricing** - WBNB/USDT is the most liquid pair on PancakeSwap ($500M+)
✅ **Lower Slippage** - Large WBNB/USDT pool ensures stable pricing
✅ **Automatic Price Discovery** - Real-time market price through two liquid pairs
✅ **Cost Effective** - No need to split liquidity across multiple pairs

## Price Calculation Verification

To verify the contract is calculating prices correctly:

1. **Check 1DREAM/WBNB price** on PancakeSwap
2. **Check WBNB/USDT price** on PancakeSwap
3. **Multiply them** to get 1DREAM/USDT price
4. **Call `getOneDreamPrice()`** on your contract
5. **Compare results** - should match

## Important Notes

⚠️ **WBNB Address is hardcoded**: `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`

⚠️ **WBNB/USDT Pair is official PancakeSwap**: `0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE`

⚠️ **Price routing adds 2 external calls** but still very gas efficient

⚠️ **Test price feed before announcing** to ensure accuracy

## Example Deployment Values

```javascript
// Using Hardhat/Ethers.js
const OneDreamVaultStaking = await ethers.getContractFactory("OneDreamVaultStaking");
const contract = await OneDreamVaultStaking.deploy(
    "0x55d398326f99059fF775485246999027B3197955",  // USDT
    "0xYOUR_1DREAM_TOKEN_ADDRESS",                  // 1Dream
    "0xYOUR_1DREAM_WBNB_PAIR_ADDRESS",              // 1Dream/WBNB
    "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE"   // WBNB/USDT
);
await contract.deployed();
console.log("Contract deployed to:", contract.address);
```

## Testing Checklist

Before going live:

```
□ Contract deployed successfully
□ Contract verified on BSCScan
□ getOneDreamPrice() returns non-zero value
□ Price matches manual calculation (1DREAM→WBNB→USDT)
□ Test stake with small amount ($10)
□ Test reward calculation
□ Test claiming rewards
□ Verify 1DREAM tokens transfer correctly
```

## Common Issues

**Issue: getOneDreamPrice() returns 0**
- Solution: Check pair addresses are correct
- Verify both pairs have liquidity

**Issue: Price seems wrong**
- Solution: Manually calculate: (1DREAM in WBNB) × (WBNB in USDT)
- Check decimals match

**Issue: Transaction fails**
- Solution: Ensure sufficient BNB for gas
- Verify all addresses are correct

## Need Help?

- BSC Explorer: https://bscscan.com
- PancakeSwap: https://pancakeswap.finance
- WBNB Contract: https://bscscan.com/token/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c
- USDT Contract: https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955

---

**Ready to Deploy!** 🚀

This configuration allows you to use your existing liquidity without needing to create a separate 1DREAM/USDT pair.
