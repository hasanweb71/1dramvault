# Deployment Parameters Reference

## 🔑 Required Addresses for BSC Mainnet Deployment

### Token Addresses

**USDT (Binance-Peg BSC-USD)**
```
Address: 0x55d398326f99059fF775485246999027B3197955
Network: BSC Mainnet
Chain ID: 56
Decimals: 18
```

**1Dream Token**
```
Address: [YOUR_1DREAM_TOKEN_ADDRESS]
Network: BSC Mainnet
Chain ID: 56
Decimals: [YOUR_TOKEN_DECIMALS]
```

**PancakeSwap V2 Pair (1Dream/USDT)**
```
Address: [YOUR_PAIR_ADDRESS]
Network: BSC Mainnet
Chain ID: 56
Note: Create this pair first before deploying staking contract
```

---

## 📋 Constructor Parameters

When deploying `OneDreamVaultStaking.sol`, use these exact parameters:

```solidity
constructor(
    address _usdtToken,      // 0x55d398326f99059fF775485246999027B3197955
    address _oneDreamToken,  // YOUR_1DREAM_TOKEN_ADDRESS
    address _pancakeSwapPair // YOUR_PANCAKESWAP_PAIR_ADDRESS
)
```

### Example Deployment Call
```javascript
// Using Hardhat/Ethers.js
const OneDreamVaultStaking = await ethers.getContractFactory("OneDreamVaultStaking");
const contract = await OneDreamVaultStaking.deploy(
    "0x55d398326f99059fF775485246999027B3197955",  // USDT
    "0xYOUR_1DREAM_TOKEN_ADDRESS",                  // 1Dream
    "0xYOUR_PANCAKESWAP_PAIR_ADDRESS"               // Pair
);
await contract.deployed();
console.log("Contract deployed to:", contract.address);
```

### Using Remix IDE
1. Compile contract
2. Switch to "Deploy & Run"
3. Select "Injected Provider - MetaMask"
4. Connect to BSC Mainnet
5. Enter constructor parameters:
   - `_usdtToken`: `0x55d398326f99059fF775485246999027B3197955`
   - `_oneDreamToken`: `[YOUR_ADDRESS]`
   - `_pancakeSwapPair`: `[YOUR_PAIR_ADDRESS]`
6. Deploy and confirm transaction

---

## 📊 Initial Package Parameters

Create these 4 packages after deployment:

### Package 1: Bronze
```javascript
createPackage(
    "Bronze",                              // name
    ethers.parseUnits("100", 18),         // minAmount (100 USDT)
    ethers.parseUnits("500", 18),         // maxAmount (500 USDT)
    100,                                   // dailyRateBasisPoints (1%)
    120,                                   // baseDurationDays (120 days)
    4                                      // referralBonusDays (4 days)
)
```

Raw values for BSCScan/Remix:
```
name: Bronze
minAmount: 100000000000000000000
maxAmount: 500000000000000000000
dailyRateBasisPoints: 100
baseDurationDays: 120
referralBonusDays: 4
```

### Package 2: Silver
```javascript
createPackage(
    "Silver",
    ethers.parseUnits("600", 18),
    ethers.parseUnits("1000", 18),
    100,
    120,
    8
)
```

Raw values:
```
name: Silver
minAmount: 600000000000000000000
maxAmount: 1000000000000000000000
dailyRateBasisPoints: 100
baseDurationDays: 120
referralBonusDays: 8
```

### Package 3: Gold
```javascript
createPackage(
    "Gold",
    ethers.parseUnits("1000", 18),
    ethers.parseUnits("5000", 18),
    100,
    120,
    12
)
```

Raw values:
```
name: Gold
minAmount: 1000000000000000000000
maxAmount: 5000000000000000000000
dailyRateBasisPoints: 100
baseDurationDays: 120
referralBonusDays: 12
```

### Package 4: Diamond
```javascript
createPackage(
    "Diamond",
    ethers.parseUnits("6000", 18),
    ethers.parseUnits("10000", 18),
    100,
    120,
    15
)
```

Raw values:
```
name: Diamond
minAmount: 6000000000000000000000
maxAmount: 10000000000000000000000
dailyRateBasisPoints: 100
baseDurationDays: 120
referralBonusDays: 15
```

---

## 🔧 Gas Price Settings

### BSC Mainnet Gas Settings
```
Gas Price: 3 Gwei (standard)
Gas Price: 5 Gwei (fast)
Gas Price: 10 Gwei (instant)
```

### Estimated Gas Costs
```
Contract Deployment: ~3,500,000 gas (~0.03 BNB at 3 Gwei)
Create Package: ~150,000 gas (~0.0005 BNB)
User Stake: ~200,000 gas (~0.0006 BNB)
Claim Rewards: ~100,000 gas (~0.0003 BNB)
Withdraw USDT: ~100,000 gas (~0.0003 BNB)
```

---

## 🌐 Network Configuration

### BSC Mainnet (MetaMask)
```
Network Name: Smart Chain
RPC URL: https://bsc-dataseed.bnbchain.org
Chain ID: 56
Symbol: BNB
Block Explorer: https://bscscan.com
```

### For Hardhat
```javascript
module.exports = {
  networks: {
    bsc: {
      url: "https://bsc-dataseed.bnbchain.org",
      chainId: 56,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 3000000000, // 3 Gwei
    }
  }
};
```

---

## 💰 Funding Requirements

### Deployment Wallet
```
BNB for Gas: 0.05 BNB minimum (~$25)
Recommended: 0.1 BNB for safety
```

### Reward Pool
```
Initial Funding: 1,000,000 - 10,000,000 1Dream tokens
Depends on expected staking volume

Calculation:
- Expected stakers: 100 users
- Average stake: $1,000 USDT
- Daily rewards: 1% = $10 USDT worth per user
- If 1Dream = $0.005: 2,000 tokens per user per day
- Total daily: 200,000 1Dream tokens
- For 6 months: ~36,000,000 tokens needed
```

### Liquidity Pool
```
Recommended PancakeSwap Liquidity:
- Minimum: $10,000 ($5k USDT + $5k 1Dream)
- Good: $50,000
- Excellent: $100,000+

Higher liquidity = More accurate price = Better user experience
```

---

## 📝 Pre-Deployment Checklist

```
□ 1Dream token deployed and verified
□ PancakeSwap pair created (1Dream/USDT)
□ Liquidity added to pair ($10k+ recommended)
□ Pair address obtained and verified
□ Owner wallet funded with BNB (0.05+ BNB)
□ Owner wallet funded with 1Dream for rewards (1M+ tokens)
□ Network configured in wallet (BSC Mainnet)
□ Contract code reviewed and tested on testnet
□ All addresses documented and verified
```

---

## 🔐 Post-Deployment Actions

### Immediate (Within 1 hour)
```
□ Verify contract on BSCScan
□ Fund reward pool (transfer 1Dream to contract)
□ Create 4 packages (Bronze, Silver, Gold, Diamond)
□ Test with small stake ($10)
□ Verify price feed works
□ Add contract address to .env
```

### Within 24 hours
```
□ Test all user functions
□ Test all admin functions
□ Verify events emit correctly
□ Set up monitoring dashboard
□ Prepare announcement for community
```

### Within 1 week
```
□ Monitor daily activity
□ Gather user feedback
□ Adjust packages if needed
□ Ensure reward pool adequacy
□ Complete marketing launch
```

---

## 📞 Important Addresses to Save

After deployment, document these addresses:

```
Contract Address: ____________________________________
Owner Wallet: ____________________________________
1Dream Token: ____________________________________
USDT Token: 0x55d398326f99059fF775485246999027B3197955
PancakeSwap Pair: ____________________________________
BSCScan Link: https://bscscan.com/address/[CONTRACT_ADDRESS]
```

---

## 🔍 Verification Details for BSCScan

When verifying on BSCScan:

```
Compiler Type: Solidity (Single file)
Compiler Version: v0.8.20+commit.a1b79de6
Open Source License Type: MIT
Optimization: Yes
Runs: 200

Constructor Arguments (ABI-encoded):
[Will be auto-filled by BSCScan]
```

---

## 🆘 Emergency Contacts

Keep these handy during deployment:

```
BSC RPC Issues: https://docs.bnbchain.org/docs/rpc
BSCScan Support: https://bscscan.com/contactus
PancakeSwap: https://pancakeswap.finance
BSC Developer Docs: https://docs.bnbchain.org
```

---

## ✅ Final Verification Steps

Before announcing to community:

```
□ Contract verified on BSCScan
□ All 4 packages visible in admin panel
□ Test stake successful (with real wallet)
□ Test claim successful
□ Price feed showing correct price
□ Admin panel accessible only to owner
□ Reward pool has sufficient balance
□ Monitoring dashboard set up
```

---

**Ready for Deployment!**

Follow the guides in order:
1. This file (parameters)
2. `VAULT_DEPLOYMENT_GUIDE.md` (deployment)
3. `QUICK_SETUP_AFTER_DEPLOYMENT.md` (post-deployment)

Good luck! 🚀
