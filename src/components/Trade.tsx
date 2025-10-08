import React from 'react';
import { TrendingUp, ArrowUpDown, ExternalLink, Activity, Wallet, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useTokenData } from '../hooks/useTokenData';
import { ethers } from 'ethers';
import { retryWithBackoff } from '../utils/ethersUtils';

// ERC20 Token ABI for balance and approval
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

// PancakeSwap Router V2 ABI
const PANCAKESWAP_ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
];

// Contract addresses
const PANCAKESWAP_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const TOKEN_ADDRESS = '0x0C98F3e79061E0dB9569cd2574d8aac0d5023965';
const BSC_RPC_URL = 'https://bsc-mainnet.infura.io/v3/334c9d74df9741a187da907c45c4b600';

interface TradeProps {
  isWalletConnected: boolean;
  walletAddress: string;
  onWalletConnect: () => void;
}

export default function Trade({ isWalletConnected, walletAddress, onWalletConnect }: TradeProps) {
  const [fromToken, setFromToken] = React.useState('BNB');
  const [toToken, setToToken] = React.useState('1DREAM');
  const [fromAmount, setFromAmount] = React.useState('');
  const [toAmount, setToAmount] = React.useState('');
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [swapError, setSwapError] = React.useState('');
  const [exchangeRate, setExchangeRate] = React.useState(0);
  const [priceImpact, setPriceImpact] = React.useState(0);
  const [transactionFee, setTransactionFee] = React.useState(0.25);
  const [walletBalances, setWalletBalances] = React.useState({
    BNB: '0.00',
    USDT: '0.00',
    '1DREAM': '0.00'
  });
  const [isLoadingBalances, setIsLoadingBalances] = React.useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = React.useState(false);
  const { data: tokenData, loading, error } = useTokenData();

  // Token configurations
  const tokens = {
    BNB: {
      symbol: 'BNB',
      name: 'Binance Coin',
      logo: 'https://globalhealth.com.bd/wp-content/uploads/2025/06/bnb-1.png',
      address: WBNB_ADDRESS,
      decimals: 18,
      isNative: true
    },
    USDT: {
      symbol: 'USDT',
      name: 'Tether USD',
      logo: 'https://globalhealth.com.bd/wp-content/uploads/2025/06/usdt-1-e1751137977936.png',
      address: USDT_ADDRESS,
      decimals: 18,
      isNative: false
    },
    '1DREAM': {
      symbol: '1DREAM',
      name: '1DREAM Token',
      logo: 'https://exnai.com/wp-content/uploads/2025/09/1-Dream-Logo.png',
      address: TOKEN_ADDRESS,
      decimals: 18,
      isNative: false
    }
  };

  const dexPlatforms = [
    { 
      name: 'DexTools', 
      href: 'https://www.dextools.io/app/en/bnb/pair-explorer/0xc80942ecb8004784551ea5c460134463ac2962b5?t=1757693203075', 
      icon: '🔧',
      description: 'Advanced trading tools',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      name: 'PooCoin', 
      href: 'https://poocoin.app/tokens/0x0c98f3e79061e0db9569cd2574d8aac0d5023965', 
      icon: '💩',
      description: 'Real-time charts',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      name: 'DexScreener', 
      href: 'https://dexscreener.com/bsc/0xc80942ecb8004784551ea5c460134463ac2962b5', 
      icon: '📊',
      description: 'Multi-chain analytics',
      color: 'from-green-500 to-green-600'
    },
    { 
      name: 'PancakeSwap', 
      href: 'https://pancakeswap.finance/swap?outputCurrency=0x0C98F3e79061E0dB9569cd2574d8aac0d5023965&chainId=56&chain=bsc&inputCurrency=0x55d398326f99059fF775485246999027B3197955', 
      icon: '🥞',
      description: 'Leading BSC DEX',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const marketData = [
    { 
      label: 'Price', 
      value: loading ? '...' : tokenData.priceUsdt, 
      change: loading ? '...' : `${tokenData.priceChange24h >= 0 ? '+' : ''}${tokenData.priceChange24h.toFixed(2)}%`, 
      positive: tokenData.priceChange24h >= 0 
    },
    { 
      label: 'Market Cap', 
      value: loading ? '...' : tokenData.marketCap, 
      change: loading ? '...' : `${tokenData.priceChange24h >= 0 ? '+' : ''}${tokenData.priceChange24h.toFixed(2)}%`, 
      positive: tokenData.priceChange24h >= 0 
    },
    { 
      label: '24h Volume', 
      value: loading ? '...' : tokenData.volume24h, 
      change: loading ? '...' : `${tokenData.priceChange24h >= 0 ? '+' : ''}${(tokenData.priceChange24h * 0.7).toFixed(1)}%`, 
      positive: tokenData.priceChange24h >= 0 
    },
    { 
      label: 'Liquidity', 
      value: loading ? '...' : tokenData.liquidity, 
      change: loading ? '...' : `${tokenData.priceChange24h >= 0 ? '+' : ''}${(tokenData.priceChange24h * 0.3).toFixed(1)}%`, 
      positive: tokenData.priceChange24h >= 0 
    }
  ];

  // Fetch wallet balances
  const fetchWalletBalances = async () => {
    if (!isWalletConnected || !walletAddress) return;
    
    setIsLoadingBalances(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Fetch BNB balance
      const bnbBalanceWei = await retryWithBackoff(() => provider.getBalance(walletAddress));
      const bnbBalance = ethers.formatEther(bnbBalanceWei);
      
      // Create token contracts for USDT and 1DREAM
      const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
      const dreamContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
      
      // Fetch token balances
      const [usdtBalanceWei, dreamBalanceWei] = await Promise.all([
        retryWithBackoff(() => usdtContract.balanceOf(walletAddress)),
        retryWithBackoff(() => dreamContract.balanceOf(walletAddress))
      ]);
      
      // Format token balances (both USDT and 1DREAM use 18 decimals on BSC)
      const usdtBalance = ethers.formatUnits(usdtBalanceWei, 18);
      const dreamBalance = ethers.formatUnits(dreamBalanceWei, 18);
      
      // Update wallet balances state
      setWalletBalances({
        BNB: parseFloat(bnbBalance).toFixed(8),
        USDT: parseFloat(usdtBalance).toFixed(8),
        '1DREAM': parseFloat(dreamBalance).toFixed(8)
      });
      
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      setSwapError('Failed to fetch wallet balances. Please try again.');
      
      // Set fallback balances on error
      setWalletBalances({
        BNB: '0.00000000',
        USDT: '0.00000000',
        '1DREAM': '0.00000000'
      });
    }
    
    setIsLoadingBalances(false);
  };

  // Get swap amounts from PancakeSwap router
  const getSwapAmounts = async (fromTokenSymbol: string, toTokenSymbol: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsLoadingPrice(true);
    try {
      const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
      const routerContract = new ethers.Contract(PANCAKESWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ABI, provider);
      
      const fromTokenConfig = tokens[fromTokenSymbol as keyof typeof tokens];
      const toTokenConfig = tokens[toTokenSymbol as keyof typeof tokens];
      
      if (!fromTokenConfig || !toTokenConfig) return;
      
      const amountIn = ethers.parseUnits(amount, fromTokenConfig.decimals);
      
      // Construct path
      let path: string[] = [];
      if (fromTokenSymbol === 'BNB' && toTokenSymbol === '1DREAM') {
        path = [WBNB_ADDRESS, TOKEN_ADDRESS];
      } else if (fromTokenSymbol === '1DREAM' && toTokenSymbol === 'BNB') {
        path = [TOKEN_ADDRESS, WBNB_ADDRESS];
      } else if (fromTokenSymbol === 'USDT' && toTokenSymbol === '1DREAM') {
        path = [USDT_ADDRESS, WBNB_ADDRESS, TOKEN_ADDRESS];
      } else if (fromTokenSymbol === '1DREAM' && toTokenSymbol === 'USDT') {
        path = [TOKEN_ADDRESS, WBNB_ADDRESS, USDT_ADDRESS];
      } else if (fromTokenSymbol === 'BNB' && toTokenSymbol === 'USDT') {
        path = [WBNB_ADDRESS, USDT_ADDRESS];
      } else if (fromTokenSymbol === 'USDT' && toTokenSymbol === 'BNB') {
        path = [USDT_ADDRESS, WBNB_ADDRESS];
      }
      
      if (path.length === 0) return;
      
      const amountsOut = await routerContract.getAmountsOut(amountIn, path);
      const amountOut = amountsOut[amountsOut.length - 1];
      const formattedAmountOut = ethers.formatUnits(amountOut, toTokenConfig.decimals);
      
      const rate = parseFloat(formattedAmountOut) / parseFloat(amount);
      const impact = parseFloat(amount) > 1 ? Math.min(0.5, parseFloat(amount) * 0.001) : 0.1;
      
      setExchangeRate(rate);
      setToAmount(parseFloat(formattedAmountOut).toFixed(6));
      setPriceImpact(impact);
      
    } catch (error) {
      console.error('Error getting swap amounts:', error);
      setSwapError('Failed to get swap price. Please try again.');
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Fetch wallet balances when wallet connects
  React.useEffect(() => {
    if (isWalletConnected && walletAddress) {
      fetchWalletBalances();
    }
  }, [isWalletConnected, walletAddress]);

  // Calculate exchange rate and price impact using PancakeSwap router
  React.useEffect(() => {
    if (fromAmount && fromToken && toToken && isWalletConnected) {
      const timeoutId = setTimeout(() => {
        getSwapAmounts(fromToken, toToken, fromAmount);
      }, 500); // Debounce API calls
      
      return () => clearTimeout(timeoutId);
    } else {
      setToAmount('');
      setExchangeRate(0);
      setPriceImpact(0);
    }
  }, [fromAmount, fromToken, toToken, isWalletConnected]);

  // Handle swap execution
  const executeSwap = async () => {
    if (!isWalletConnected) {
      setSwapError('Please connect your wallet first.');
      return;
    }
    
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setSwapError('Please enter a valid amount.');
      return;
    }

    if (!toAmount || parseFloat(toAmount) <= 0) {
      setSwapError('Invalid swap amount. Please try again.');
      return;
    }
    
    setIsSwapping(true);
    setSwapError('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const routerContract = new ethers.Contract(PANCAKESWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ABI, signer);
      
      const fromTokenConfig = tokens[fromToken as keyof typeof tokens];
      const toTokenConfig = tokens[toToken as keyof typeof tokens];
      
      const amountIn = ethers.parseUnits(fromAmount, fromTokenConfig.decimals);
      const amountOutMin = ethers.parseUnits((parseFloat(toAmount) * 0.95).toString(), toTokenConfig.decimals); // 5% slippage
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      
      // Construct path
      let path: string[] = [];
      if (fromToken === 'BNB' && toToken === '1DREAM') {
        path = [WBNB_ADDRESS, TOKEN_ADDRESS];
      } else if (fromToken === '1DREAM' && toToken === 'BNB') {
        path = [TOKEN_ADDRESS, WBNB_ADDRESS];
      } else if (fromToken === 'USDT' && toToken === '1DREAM') {
        path = [USDT_ADDRESS, WBNB_ADDRESS, TOKEN_ADDRESS];
      } else if (fromToken === '1DREAM' && toToken === 'USDT') {
        path = [TOKEN_ADDRESS, WBNB_ADDRESS, USDT_ADDRESS];
      } else if (fromToken === 'BNB' && toToken === 'USDT') {
        path = [WBNB_ADDRESS, USDT_ADDRESS];
      } else if (fromToken === 'USDT' && toToken === 'BNB') {
        path = [USDT_ADDRESS, WBNB_ADDRESS];
      }
      
      let tx;
      
      if (fromToken === 'BNB') {
        // Swap BNB for tokens
        tx = await routerContract.swapExactETHForTokens(
          amountOutMin,
          path,
          walletAddress,
          deadline,
          { value: amountIn }
        );
      } else if (toToken === 'BNB') {
        // First approve if needed
        const tokenContract = new ethers.Contract(fromTokenConfig.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(walletAddress, PANCAKESWAP_ROUTER_ADDRESS);
        
        if (allowance < amountIn) {
          const approveTx = await tokenContract.approve(PANCAKESWAP_ROUTER_ADDRESS, amountIn);
          await approveTx.wait();
        }
        
        // Swap tokens for BNB
        tx = await routerContract.swapExactTokensForETH(
          amountIn,
          amountOutMin,
          path,
          walletAddress,
          deadline
        );
      } else {
        // First approve if needed
        const tokenContract = new ethers.Contract(fromTokenConfig.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(walletAddress, PANCAKESWAP_ROUTER_ADDRESS);
        
        if (allowance < amountIn) {
          const approveTx = await tokenContract.approve(PANCAKESWAP_ROUTER_ADDRESS, amountIn);
          await approveTx.wait();
        }
        
        // Swap tokens for tokens
        tx = await routerContract.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          walletAddress,
          deadline
        );
      }
      
      // Wait for transaction confirmation
      await tx.wait();
      
      // Refresh balances and clear form
      await fetchWalletBalances();
      setFromAmount('');
      setToAmount('');
      setExchangeRate(0);
      setPriceImpact(0);
      
    } catch (error) {
      console.error('Swap failed:', error);
      if (error.code === 4001) {
        setSwapError('Transaction rejected by user.');
      } else if (error.code === -32603) {
        setSwapError('Insufficient funds or gas.');
      } else {
        setSwapError('Swap failed. Please try again.');
      }
    } finally {
      setIsSwapping(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-4">1DREAM Decentralized Exchange</h1>
          <p className="text-xl text-slate-400 dark:text-slate-400 light:text-gray-600">Trade 1DREAM tokens with zero slippage and maximum security</p>
        </div>

        {/* Market Data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {marketData.map((data, index) => (
            <div key={index} className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
              <h3 className="text-sm font-medium text-slate-400 dark:text-slate-400 light:text-gray-600 mb-2">{data.label}</h3>
              <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-1">{data.value}</p>
              <p className={`text-sm font-medium flex items-center ${
                data.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${data.positive ? '' : 'rotate-180'}`} />
                {data.change}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-6 mb-12">
          {/* Chart Section */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">Price Chart</h2>
              </div>
              
              {/* Dexscreener Embedded Chart */}
              <style dangerouslySetInnerHTML={{
                __html: `
                  #dexscreener-embed{position:relative;width:100%;padding-bottom:125%;}
                  @media(min-width:1400px){#dexscreener-embed{padding-bottom:65%;}}
                  #dexscreener-embed iframe{position:absolute;width:100%;height:100%;top:0;left:0;border:0;border-radius:12px;}
                `
              }} />
              <div id="dexscreener-embed">
                <iframe 
                  src="https://dexscreener.com/bsc/0xC80942EcB8004784551ea5c460134463ac2962b5?embed=1&loadChartSettings=0&chartLeftToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"
                  title="1DREAM Price Chart"
                />
              </div>
            </div>
          </div>

          {/* Swap Section */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">Swap Tokens</h2>
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              
              {/* Wallet Connection Status */}
              {isWalletConnected ? (
                <div className="mb-6 p-3 bg-green-900/20 dark:bg-green-900/20 light:bg-green-50 rounded-xl border border-green-700/30 dark:border-green-700/30 light:border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <span className="text-green-400 font-medium">Wallet Connected</span>
                      <p className="text-sm text-slate-300 dark:text-slate-300 light:text-gray-600">
                        {formatAddress(walletAddress)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-900/20 dark:bg-blue-900/20 light:bg-blue-50 rounded-xl border border-blue-700/30 dark:border-blue-700/30 light:border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-medium">Wallet Required</span>
                  </div>
                  <p className="text-sm text-slate-300 dark:text-slate-300 light:text-gray-600 mb-3">
                    Connect your wallet using the button in the header to start swapping tokens
                  </p>
                  <button
                    onClick={onWalletConnect}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}

              {/* Error Message */}
              {swapError && (
                <div className="mb-4 p-3 bg-red-900/20 dark:bg-red-900/20 light:bg-red-50 rounded-xl border border-red-700/30 dark:border-red-700/30 light:border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{swapError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* From Token */}
                <div className="bg-slate-700/30 dark:bg-slate-700/30 light:bg-gray-50 rounded-xl p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-400 dark:text-slate-400 light:text-gray-600">From</label>
                    <div className="flex items-center space-x-2">
                      {isLoadingBalances && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
                      <span className="text-sm text-slate-500 dark:text-slate-500 light:text-gray-500">
                        Balance: {walletBalances[fromToken as keyof typeof walletBalances] || '0.00'} {fromToken}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      placeholder={isLoadingPrice ? "Loading..." : "0.0"}
                      disabled={!isWalletConnected}
                      className="flex-1 bg-transparent text-lg sm:text-xl font-bold text-white dark:text-white light:text-gray-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-gray-400 focus:outline-none min-w-0"
                    />
                    <div className="flex items-center space-x-0.5 flex-shrink-0 min-w-0">
                      <select
                        value={fromToken}
                        onChange={(e) => setFromToken(e.target.value)}
                        disabled={!isWalletConnected}
                        className="bg-slate-600/50 dark:bg-slate-600/50 light:bg-white border border-slate-500 dark:border-slate-500 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 text-xs sm:text-sm min-w-0 max-w-[60px] sm:max-w-none"
                      >
                        <option value="BNB">BNB</option>
                        <option value="USDT">USDT</option>
                        <option value="1DREAM">1DREAM</option>
                      </select>
                      <img 
                        src={tokens[fromToken as keyof typeof tokens]?.logo} 
                        alt={fromToken}
                        className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={swapTokens}
                    disabled={!isWalletConnected}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-full transition-colors"
                  >
                    <ArrowUpDown className="w-5 h-5 text-blue-600" />
                  </button>
                </div>

                {/* To Token */}
                <div className="bg-slate-700/30 dark:bg-slate-700/30 light:bg-gray-50 rounded-xl p-2 sm:p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-400 dark:text-slate-400 light:text-gray-600">To</label>
                    <div className="flex items-center space-x-2">
                      {isLoadingBalances && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
                      <span className="text-sm text-slate-500 dark:text-slate-500 light:text-gray-500">
                        Balance: {walletBalances[toToken as keyof typeof walletBalances] || '0.00'} {toToken}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={toAmount}
                      readOnly
                      placeholder={isLoadingPrice ? "Calculating..." : "0.0"}
                      className="flex-1 bg-transparent text-lg sm:text-xl font-bold text-white dark:text-white light:text-gray-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-gray-400 focus:outline-none min-w-0"
                    />
                    <div className="flex items-center space-x-0.5 flex-shrink-0 min-w-0">
                      <select
                        value={toToken}
                        onChange={(e) => setToToken(e.target.value)}
                        disabled={!isWalletConnected}
                        className="bg-slate-600/50 dark:bg-slate-600/50 light:bg-white border border-slate-500 dark:border-slate-500 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 text-xs sm:text-sm min-w-0 max-w-[60px] sm:max-w-none"
                      >
                        <option value="BNB">BNB</option>
                        <option value="USDT">USDT</option>
                        <option value="1DREAM">1DREAM</option>
                      </select>
                      <img 
                        src={tokens[toToken as keyof typeof tokens]?.logo} 
                        alt={toToken}
                        className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Swap Details */}
                {isWalletConnected && fromAmount && toAmount && (
                  <div className="bg-blue-900/20 dark:bg-blue-900/20 light:bg-blue-50 rounded-xl p-4 space-y-2">
                    {isLoadingPrice && (
                      <div className="flex items-center justify-center py-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-400 mr-2" />
                        <span className="text-sm text-blue-400">Getting best price...</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 dark:text-slate-400 light:text-gray-600">Exchange Rate</span>
                      <span className="text-white dark:text-white light:text-gray-900 font-medium">
                        1 {fromToken} = {isLoadingPrice ? '...' : exchangeRate.toFixed(6)} {toToken}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 dark:text-slate-400 light:text-gray-600">Price Impact</span>
                      <span className={`font-medium ${priceImpact > 0.15 ? 'text-red-600' : priceImpact > 0.05 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {isLoadingPrice ? '...' : priceImpact.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 dark:text-slate-400 light:text-gray-600">Transaction Fee</span>
                      <span className="text-white dark:text-white light:text-gray-900 font-medium">{transactionFee}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 dark:text-slate-400 light:text-gray-600">Minimum Received</span>
                      <span className="text-white dark:text-white light:text-gray-900 font-medium">
                        {isLoadingPrice ? '...' : (parseFloat(toAmount) * 0.95).toFixed(6)} {toToken}
                      </span>
                    </div>
                  </div>
                )}

                {/* Swap Button */}
                <button 
                  onClick={executeSwap}
                  disabled={!isWalletConnected || !fromAmount || !toAmount || isSwapping || isLoadingPrice}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSwapping ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Swapping...</span>
                    </div>
                  ) : isLoadingPrice ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Getting Price...</span>
                    </div>
                  ) : (
                    'Swap Tokens'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DEX Platforms */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-4">Trading Platforms</h2>
            <p className="text-base sm:text-lg text-slate-400 dark:text-slate-400 light:text-gray-600 px-4">Access 1DREAM on leading decentralized exchanges</p>
          </div>

          {/* Platform Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {dexPlatforms.map((platform, index) => (
              <a
                key={index}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${platform.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-xl sm:text-2xl">{platform.icon}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-gray-900 text-center mb-2">{platform.name}</h3>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-gray-600 text-center mb-3 sm:mb-4 leading-tight">{platform.description}</p>
                <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700">
                  <span className="text-xs sm:text-sm font-medium mr-1">Trade Now</span>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </a>
            ))}
          </div>

          {/* Platform Names */}
          <div className="text-center">
            <p className="text-sm sm:text-lg font-semibold text-slate-300 dark:text-slate-300 light:text-gray-700 px-4">
              Available on: DexTools, PooCoin, DexScreener, PancakeSwap
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}