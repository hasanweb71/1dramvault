import React from 'react';
import { X, Wallet, Shield, ExternalLink, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState('');

  const wallets = [
    {
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using MetaMask wallet',
      installed: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
      popular: true
    },
    {
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Connect using Trust Wallet',
      installed: typeof window !== 'undefined' && window.ethereum?.isTrust,
      popular: true
    },
    {
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect with mobile wallets',
      installed: false, // WalletConnect requires additional setup
      popular: false
    },
    {
      name: 'Binance Wallet',
      icon: '🟡',
      description: 'Connect using Binance Chain Wallet',
      installed: typeof window !== 'undefined' && window.ethereum?.isBinance,
      popular: false
    },
    {
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect using Coinbase Wallet',
      installed: typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet,
      popular: false
    },
    {
      name: 'SafePal',
      icon: '🔐',
      description: 'Connect using SafePal wallet',
      installed: typeof window !== 'undefined' && window.ethereum?.isSafePal,
      popular: false
    }
  ];

  const handleWalletConnect = async (walletName: string) => {
    setIsConnecting(true);
    setError('');

    try {
      // Check if Web3 provider is available
      if (!window.ethereum) {
        setError('No Web3 wallet detected. Please install MetaMask or another Web3 wallet.');
        return;
      }

      // Handle different wallet types
      if (walletName === 'MetaMask') {
        // Check if MetaMask is specifically available
        if (!window.ethereum.isMetaMask) {
          setError('MetaMask is not installed. Please install MetaMask extension.');
          return;
        }
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        setError('No accounts found. Please check your wallet.');
        return;
      }

      // Get the first account
      const userAddress = accounts[0];

      // Verify we're on the correct network (BSC Mainnet)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const bscChainId = '0x38'; // BSC Mainnet chain ID in hex
      
      if (chainId !== bscChainId) {
        // Try to switch to BSC network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: bscChainId }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: bscChainId,
                  chainName: 'Binance Smart Chain',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  rpcUrls: ['https://bsc-dataseed1.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com/'],
                }],
              });
            } catch (addError) {
              setError('Failed to add BSC network. Please add it manually.');
              return;
            }
          } else {
            setError('Please switch to Binance Smart Chain network.');
            return;
          }
        }
      }
      
      // Successfully connected
      onConnect(userAddress);
      
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (err.code === 4001) {
        setError('Connection rejected by user.');
      } else if (err.code === -32002) {
        setError('Connection request already pending. Please check your wallet.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Connect Wallet</h2>
              <p className="text-sm text-gray-600">Choose your preferred wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isConnecting && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-sm text-blue-700 font-medium">Connecting wallet...</p>
              </div>
            </div>
          )}

          {/* Wallet Options */}
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleWalletConnect(wallet.name)}
                disabled={isConnecting}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                  wallet.installed
                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{wallet.name}</span>
                        {wallet.popular && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{wallet.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {wallet.installed ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Install</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Secure Connection</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy. 
                Your wallet information is never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}