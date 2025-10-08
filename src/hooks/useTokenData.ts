import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { retryWithBackoff, createFallbackProvider } from '../utils/ethersUtils';

// Helper function to create provider with multiple RPC endpoints
const createProvider = () => {
  return createFallbackProvider();
};

interface TokenData {
  totalSupply: string;
  burned: string;
  circulating: string;
  priceUsdt: string;
  priceBnb: string;
  marketCap: string;
  volume24h: string;
  liquidity: string;
  priceChange24h: number;
  holders: string;
  holderCountError?: string | null;
  volume24hUsd: number;
  liquidityUsd: number;
}

interface UseTokenDataReturn {
  data: TokenData;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// BEP20 Token ABI (minimal required functions)
const TOKEN_ABI = [{"inputs":[{"internalType":"address","name":"routerAddress","type":"address"},{"internalType":"address","name":"aimToken","type":"address"},{"internalType":"address","name":"_devWallet","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"AutoBurn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"AUTO_BURN_BP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEAD","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEV_BP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DIVIDEND_BP","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WBNB","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"name":"addLiquidityAndOpenTrading","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"approveMax","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"burnedSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"circulatingSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"devWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributor","outputs":[{"internalType":"contract DividendDistributor","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"distributorGas","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isDividendExempt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isFeeExempt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"launchBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"liquidityBurned","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"manualSend","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"maxWalletAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"openTrading","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pair","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"projectWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"router","outputs":[{"internalType":"contract IRouter","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"gas","type":"uint256"}],"name":"setDistributorSettings","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setIsDividendExempt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setIsFeeExempt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setMaxWalletExempt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_project","type":"address"}],"name":"setProjectWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"swapThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBurned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tradingOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

// PancakeSwap Router V2 ABI (minimal required functions)
const PANCAKESWAP_ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)'
];

// PancakeSwap Pair ABI for liquidity data
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)'
];

// Contract addresses on BSC
const TOKEN_CONTRACT_ADDRESS = '0x0C98F3e79061E0dB9569cd2574d8aac0d5023965';
const PANCAKESWAP_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const PAIR_ADDRESS = '0xc80942ecb8004784551ea5c460134463ac2962b5'; // 1DREAM/WBNB pair

// BscScan API configuration
const BSC_API_URL = 'https://api.bscscan.com/api';
const BSC_API_KEY = 'SIMZX625IJ7DQYBMIVN2E95CWR4Q51MNZ2';

// Common burn addresses
const BURN_ADDRESSES = [
  '0x000000000000000000000000000000000000dEaD',
  '0x0000000000000000000000000000000000000000'
];

// Fetch data from DexScreener API
const fetchDexScreenerData = async () => {
  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/bsc/${PAIR_ADDRESS}`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res;
    });
    
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      return {
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        liquidity: parseFloat(pair.liquidity?.usd || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        priceUsd: parseFloat(pair.priceUsd || '0'),
        marketCap: parseFloat(pair.marketCap || '0')
      };
    }
  } catch (error) {
    console.warn('Failed to fetch DexScreener data after retries:', error);
  }
  return null;
};

// Fetch token holder count from BscScan API
const fetchTokenHolderCount = async (): Promise<number | string | null> => {
  try {
    const holderResponse = await retryWithBackoff(async () => {
      const holderCountApiUrl = `${BSC_API_URL}?module=token&action=tokenholdercount&contractaddress=${TOKEN_CONTRACT_ADDRESS}&apikey=${BSC_API_KEY}`;
      const res = await fetch(holderCountApiUrl, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res;
    });
    
    const holderData = await holderResponse.json();
    
    if (holderData.status === '1' && holderData.result) {
      return parseInt(holderData.result);
    }
    
    const errorMessage = holderData.message || `BscScan API Error: Status ${holderData.status}`;
    console.warn('BscScan API returned error:', {
      status: holderData.status,
      message: holderData.message,
      result: holderData.result,
      fullResponse: holderData
    });
    return errorMessage;
  } catch (error) {
    const errorMessage = `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.warn('Error fetching holder count from BscScan after retries:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return errorMessage;
  }
};

// Fetch liquidity from PancakeSwap pair contract
const fetchPairLiquidity = async (provider: ethers.JsonRpcProvider) => {
  try {
    const result = await retryWithBackoff(async () => {
      const pairContract = new ethers.Contract(PAIR_ADDRESS, PAIR_ABI, provider);
      const [reserves, token0, token1] = await Promise.all([
        pairContract.getReserves(),
        pairContract.token0(),
        pairContract.token1()
      ]);
      return { reserves, token0, token1 };
    });
    
    const [reserve0, reserve1] = result.reserves;
    const { token0, token1 } = result;
    
    // Determine which reserve is WBNB
    const isToken0WBNB = token0.toLowerCase() === WBNB_ADDRESS.toLowerCase();
    const wbnbReserve = isToken0WBNB ? reserve0 : reserve1;
    const dreamReserve = isToken0WBNB ? reserve1 : reserve0;
    
    // Convert reserves to readable format
    const wbnbAmount = parseFloat(ethers.formatEther(wbnbReserve));
    const dreamAmount = parseFloat(ethers.formatEther(dreamReserve));
    
    // Get BNB price in USD from router
    let bnbPriceUsd = 600; // fallback
    try {
      bnbPriceUsd = await retryWithBackoff(async () => {
        const routerContract = new ethers.Contract(PANCAKESWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ABI, provider);
        const bnbAmount = ethers.parseEther('1');
        const pathBnbToUsdt = [WBNB_ADDRESS, USDT_ADDRESS];
        const amountsOut = await routerContract.getAmountsOut(bnbAmount, pathBnbToUsdt);
        return parseFloat(ethers.formatUnits(amountsOut[1], 18));
      });
    } catch (error) {
      console.warn('Failed to fetch BNB price after retries, using fallback:', error);
    }
    
    const liquidityUsd = wbnbAmount * bnbPriceUsd * 2; // Total liquidity = 2 * WBNB value
    
    return {
      liquidityUsd,
      wbnbAmount,
      dreamAmount,
      bnbPriceUsd
    };
  } catch (error) {
    console.warn('Failed to fetch pair liquidity after retries:', error);
    return null;
  }
};
export const useTokenData = (): UseTokenDataReturn => {
  const [data, setData] = useState<TokenData>({
    totalSupply: '888,888',
    burned: '44,444',
    circulating: '844,444',
    priceUsdt: '$0.0234',
    priceBnb: '0.000012 BNB',
    marketCap: '$19.8M',
    volume24h: '$2.4M',
    priceChange24h: 12.5,
    holders: '12,547',
    holderCountError: null,
    volume24hUsd: 2400000,
    liquidityUsd: 1200000
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache for token data to avoid repeated fetches
  const [tokenCache, setTokenCache] = useState<{
    data: TokenData;
    timestamp: number;
  } | null>(null);

  // Cache duration: 3 minutes (token data changes more frequently than staking plans)
  const CACHE_DURATION = 3 * 60 * 1000;

  const fetchTokenData = async () => {
    // Check cache first (unless force refresh is requested)
    if (tokenCache) {
      const now = Date.now();
      const cacheAge = now - tokenCache.timestamp;
      
      if (cacheAge < CACHE_DURATION) {
        // Use cached data
        setData(tokenCache.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Initialize provider and contracts
      const provider = createProvider();
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);
      const routerContract = new ethers.Contract(PANCAKESWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ABI, provider);

      // Fetch data in parallel with error handling
      const [dexScreenerData, holderCount, totalSupplyRaw, decimals] = await Promise.allSettled([
        fetchDexScreenerData(),
        fetchTokenHolderCount(),
        retryWithBackoff(() => tokenContract.totalSupply()),
        retryWithBackoff(() => tokenContract.decimals())
      ]);
      
      // Extract results from Promise.allSettled
      const dexData = dexScreenerData.status === 'fulfilled' ? dexScreenerData.value : null;
      const holderResult = holderCount.status === 'fulfilled' ? holderCount.value : 'N/A';
      const totalSupply = totalSupplyRaw.status === 'fulfilled' ? totalSupplyRaw.value : null;
      const tokenDecimals = decimals.status === 'fulfilled' ? decimals.value : 18;
      
      if (!totalSupply) {
        throw new Error('Failed to fetch basic token data');
      }
      
      // Handle holder count result
      let holdersValue: string;
      let holderError: string | null = null;
      
      if (typeof holderResult === 'string') {
        // Error occurred
        holderError = holderResult;
        holdersValue = 'N/A';
      } else if (typeof holderResult === 'number') {
        // Success
        holdersValue = formatNumber(holderResult.toString());
      } else {
        // Null result, use fallback
        holdersValue = 'N/A';
      }
      
      // Fetch pair liquidity
      const pairData = await fetchPairLiquidity(provider);

      // Calculate burned tokens
      let totalBurned = BigInt(0);
      for (const burnAddress of BURN_ADDRESSES) {
        try {
          const burnedBalance = await retryWithBackoff(() => tokenContract.balanceOf(burnAddress));
          totalBurned += BigInt(burnedBalance.toString());
        } catch (err) {
          console.warn(`Failed to fetch balance for burn address ${burnAddress}:`, err);
        }
      }

      // Convert to readable format
      const totalSupplyFormatted = ethers.formatUnits(totalSupply, tokenDecimals);
      const burned = ethers.formatUnits(totalBurned, tokenDecimals);
      const circulating = ethers.formatUnits(BigInt(totalSupply.toString()) - totalBurned, tokenDecimals);

      // Format numbers
      const formatNumber = (num: string) => {
        const parsed = parseFloat(num);
        if (parsed >= 1000000) {
          return (parsed / 1000000).toFixed(1) + 'M';
        } else if (parsed >= 1000) {
          return (parsed / 1000).toFixed(1) + 'K';
        }
        return Math.floor(parsed).toLocaleString();
      };

      // Format currency values
      const formatCurrency = (value: number) => {
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(1)}K`;
        }
        return `$${value.toFixed(2)}`;
      };
      // Fetch prices from PancakeSwap
      let priceUsdt = '$0.0234';
      let priceBnb = '0.000012 BNB';
      let marketCap = '$19.8M';
      let volume24h = '$2.4M';
      let liquidity = '$1.2M';
      let priceChange24h = 12.5;
      let volume24hUsd = 2400000;
      let liquidityUsd = 1200000;

      // Use DexScreener data if available
      if (dexData) {
        volume24hUsd = dexData.volume24h;
        volume24h = formatCurrency(volume24hUsd);
        priceChange24h = dexData.priceChange24h;
        liquidityUsd = dexData.liquidity || liquidityUsd;
        
        if (dexData.priceUsd > 0) {
          priceUsdt = `$${dexData.priceUsd.toFixed(6)}`;
          
          // Use DexScreener market cap if available, otherwise calculate
          if (dexData.marketCap > 0) {
            marketCap = formatCurrency(dexData.marketCap);
          } else {
            const circulatingNum = parseFloat(circulating);
            const marketCapValue = circulatingNum * dexData.priceUsd;
            marketCap = formatCurrency(marketCapValue);
          }
        }
      }
      
      // Use pair data if available
      if (pairData) {
        // Only use pair data if DexScreener doesn't have liquidity data
        if (!dexData || !dexData.liquidity) {
          liquidityUsd = pairData.liquidityUsd;
        }
      }
      
      // Format liquidity after all data sources are processed
      liquidity = formatCurrency(liquidityUsd);
      try {
        // Amount to check (1 token with proper decimals)
        const amountIn = ethers.parseUnits('1', tokenDecimals);

        // Get 1DREAM -> USDT price
        try {
          const usdtPrice = await retryWithBackoff(async () => {
            const pathToUsdt = [TOKEN_CONTRACT_ADDRESS, WBNB_ADDRESS, USDT_ADDRESS];
            const amountsOutUsdt = await routerContract.getAmountsOut(amountIn, pathToUsdt);
            const usdtOut = ethers.formatUnits(amountsOutUsdt[amountsOutUsdt.length - 1], 18); // USDT has 18 decimals on BSC
            return parseFloat(usdtOut);
          });
          
          // Only use router price if DexScreener data is not available
          if (!dexData || dexData.priceUsd === 0) {
            priceUsdt = `$${usdtPrice.toFixed(6)}`;
          }
          
          // Calculate market cap using USDT price
          const circulatingNum = parseFloat(circulating);
          const priceForMarketCap = dexData?.priceUsd || usdtPrice;
          const marketCapValue = circulatingNum * priceForMarketCap;
          if (marketCapValue >= 1000000) {
            marketCap = `$${(marketCapValue / 1000000).toFixed(1)}M`;
          } else if (marketCapValue >= 1000) {
            marketCap = `$${(marketCapValue / 1000).toFixed(1)}K`;
          } else {
            marketCap = `$${marketCapValue.toFixed(2)}`;
          }
        } catch (usdtError) {
          console.warn('Failed to fetch USDT price from PancakeSwap after retries:', usdtError);
          // Try direct path without WBNB
          try {
            const directUsdtPrice = await retryWithBackoff(async () => {
              const directPathToUsdt = [TOKEN_CONTRACT_ADDRESS, USDT_ADDRESS];
              const directAmountsOutUsdt = await routerContract.getAmountsOut(amountIn, directPathToUsdt);
              const directUsdtOut = ethers.formatUnits(directAmountsOutUsdt[directAmountsOutUsdt.length - 1], 18);
              return parseFloat(directUsdtOut);
            });
            
            if (!dexData || dexData.priceUsd === 0) {
              priceUsdt = `$${directUsdtPrice.toFixed(6)}`;
            }
          } catch (directError) {
            console.warn('Direct USDT path also failed after retries:', directError);
          }
        }

        // Get 1DREAM -> BNB price
        try {
          const bnbPrice = await retryWithBackoff(async () => {
            const pathToBnb = [TOKEN_CONTRACT_ADDRESS, WBNB_ADDRESS];
            const amountsOutBnb = await routerContract.getAmountsOut(amountIn, pathToBnb);
            const bnbOut = ethers.formatUnits(amountsOutBnb[amountsOutBnb.length - 1], 18);
            return parseFloat(bnbOut);
          });
          
          priceBnb = `${bnbPrice.toFixed(8)} BNB`;
        } catch (bnbError) {
          console.warn('Failed to fetch BNB price from PancakeSwap after retries:', bnbError);
        }

      } catch (priceError) {
        console.warn('Failed to fetch prices from PancakeSwap after retries:', priceError);
        // Keep fallback prices
      }

      const newTokenData = {
        totalSupply: formatNumber(totalSupplyFormatted),
        burned: formatNumber(burned),
        circulating: formatNumber(circulating),
        priceUsdt,
        priceBnb,
        marketCap,
        volume24h,
        liquidity,
        priceChange24h,
        holders: holdersValue,
        holderCountError: holderError,
        volume24hUsd,
        liquidityUsd
      };

      setData(newTokenData);

      // Update cache
      setTokenCache({
        data: newTokenData,
        timestamp: Date.now()
      });

    } catch (err) {
      console.error('Error fetching token data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch live token data: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const refresh = (forceRefresh: boolean = true) => {
    if (forceRefresh) {
      // Clear cache to force fresh fetch
      setTokenCache(null);
    }
    fetchTokenData();
  };

  useEffect(() => {
    fetchTokenData(); // This will check cache first
    
    // Set up auto-refresh every 3 minutes (matches cache duration)
    const interval = setInterval(() => fetchTokenData(), 180000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refresh };
};