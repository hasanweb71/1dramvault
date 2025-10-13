import React from 'react';
import { Wallet, Menu, X, Info, FileText } from 'lucide-react';

type ActiveView = 'home' | 'trade' | 'dapps' | 'roadmap' | 'defi';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isWalletConnected: boolean;
  walletAddress: string;
  isOwner: boolean;
  checkingOwner: boolean;
  onWalletConnect: () => void;
  onWalletDisconnect: () => void;
}

export default function Header({ 
  activeView, 
  setActiveView, 
  isWalletConnected, 
  walletAddress,
  isOwner,
  checkingOwner,
  onWalletConnect,
  onWalletDisconnect
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const baseNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'trade', label: 'Trade' },
    { id: 'dapps', label: 'Dapps' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'defi', label: 'DEFI' },
  ] as const;

  // Only show admin button if user is contract owner
  const navItems = [
    ...baseNavItems,
    ...(isOwner ? [{ id: 'admin' as const, label: 'Admin' }] : [])
  ];
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <img 
                src="https://exnai.com/wp-content/uploads/2025/09/1-Dream-Logo.png" 
                alt="1DREAM Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <span className="text-white font-bold text-xs hidden">1D</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">1DREAM</h1>
              <p className="text-xs text-slate-400">Staking Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => !item.disabled && setActiveView(item.id)}
                  disabled={item.disabled}
                  className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 relative overflow-hidden ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 scale-105'
                      : item.disabled
                      ? 'text-slate-300 opacity-50 cursor-not-allowed'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50 group'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {activeView !== item.id && !item.disabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </button>
                {item.tooltip && (
                  <span className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                    {item.tooltip}
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* Theme Switcher, Wallet Connection & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Whitepaper Link */}
            <a
              href="https://1dreamtoken.com/white-paper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-300 group"
            >
              <FileText className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm font-medium">Whitepaper</span>
            </a>

            {/* Wallet Button */}
            {isWalletConnected ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
                </div>
                <button
                  onClick={onWalletDisconnect}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-medium text-sm hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onWalletConnect}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/50">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 text-left flex items-center justify-between ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : item.disabled
                      ? 'text-slate-300 opacity-50 cursor-not-allowed'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{item.label}{item.tooltip && <span className="text-xs ml-2 opacity-75">({item.tooltip})</span>}</span>
                </button>
              ))}

              {/* Whitepaper Link for Mobile */}
              <a
                href="https://1dreamtoken.com/white-paper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 text-left flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-700/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="w-4 h-4" />
                <span>Whitepaper</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}