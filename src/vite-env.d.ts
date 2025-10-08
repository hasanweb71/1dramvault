/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isTrust?: boolean;
    isBinance?: boolean;
    isCoinbaseWallet?: boolean;
    isSafePal?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
}
