import { ethers } from 'ethers';

// BSC RPC endpoints with automatic fallback
export const BSC_RPC_URLS = [
  'https://bsc-dataseed.bnbchain.org',
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://rpc.ankr.com/bsc',
  'https://bsc.publicnode.com',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed2.defibit.io',
  'https://1rpc.io/bnb',
  'https://bsc-rpc.gateway.pokt.network'
];

// Create provider with automatic fallback
export const createFallbackProvider = (): ethers.JsonRpcProvider => {
  // Try each RPC URL until one works
  for (const url of BSC_RPC_URLS) {
    try {
      return new ethers.JsonRpcProvider(url);
    } catch (error) {
      console.warn(`Failed to create provider with ${url}:`, error);
      continue;
    }
  }
  
  // Fallback to first URL if all fail during creation
  return new ethers.JsonRpcProvider(BSC_RPC_URLS[0]);
};

// Retry function with exponential backoff (optimized)
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Log retry attempts for debugging (only in development)
      if (attempt < maxRetries && import.meta.env.DEV) {
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${baseDelay * Math.pow(1.5, attempt)}ms`);
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with reduced multiplier and jitter
      const delay = baseDelay * Math.pow(1.5, attempt) + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};