import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const TOKEN_ADDRESS = '0x0C98F3e79061E0dB9569cd2574d8aac0d5023965';
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

interface TokenStats {
  maxSupply: string;
  burned: string;
  circulating: string;
  loading: boolean;
}

export function useTokenStats() {
  const [stats, setStats] = useState<TokenStats>({
    maxSupply: '888,888',
    burned: '0',
    circulating: '888,888',
    loading: true
  });

  useEffect(() => {
    const fetchTokenStats = async () => {
      try {
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org:443');
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);

        const [totalSupply, deadBalance, zeroBalance, decimals] = await Promise.all([
          tokenContract.totalSupply(),
          tokenContract.balanceOf(DEAD_ADDRESS),
          tokenContract.balanceOf(ZERO_ADDRESS),
          tokenContract.decimals()
        ]);

        const maxSupplyNum = parseFloat(ethers.formatUnits(totalSupply, decimals));
        const burnedNum = parseFloat(ethers.formatUnits(deadBalance, decimals)) +
                         parseFloat(ethers.formatUnits(zeroBalance, decimals));
        const circulatingNum = maxSupplyNum - burnedNum;

        setStats({
          maxSupply: maxSupplyNum.toLocaleString(undefined, { maximumFractionDigits: 0 }),
          burned: burnedNum.toLocaleString(undefined, { maximumFractionDigits: 0 }),
          circulating: circulatingNum.toLocaleString(undefined, { maximumFractionDigits: 0 }),
          loading: false
        });
      } catch (error) {
        console.error('Error fetching token stats:', error);
        setStats({
          maxSupply: '888,888',
          burned: '0',
          circulating: '888,888',
          loading: false
        });
      }
    };

    fetchTokenStats();
  }, []);

  return stats;
}
