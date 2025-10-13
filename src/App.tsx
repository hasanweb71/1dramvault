import React, { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Trade from './components/Trade';
import Dapps from './components/Dapps';
import Roadmap from './components/Roadmap';
import Defi from './components/Defi';
import AdminPanel from './components/AdminPanel';
import VaultAdminPanel from './components/VaultAdminPanel';
import Footer from './components/Footer';
import WalletModal from './components/WalletModal';
import StakingHistory from './components/StakingHistory';
import { useStakingData } from './hooks/useStakingData';
import { useVaultStaking } from './hooks/useVaultStaking';

type ActiveView = 'home' | 'trade' | 'dapps' | 'roadmap' | 'defi' | 'stakingHistory';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);
  const [isDappsOwner, setIsDappsOwner] = useState(false);
  const [isVaultOwner, setIsVaultOwner] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(false);

  const { checkIsOwner } = useStakingData();
  const { isOwner: vaultOwnerStatus } = useVaultStaking(walletAddress);

  // Check if connected wallet is contract owner (either DApps or Vault)
  React.useEffect(() => {
    const checkOwnership = async () => {
      if (isWalletConnected && walletAddress) {
        setCheckingOwner(true);
        try {
          const dappsOwnerStatus = await checkIsOwner(walletAddress);
          setIsDappsOwner(dappsOwnerStatus);
          setIsVaultOwner(vaultOwnerStatus);

          // User is owner if they own either contract
          setIsOwner(dappsOwnerStatus || vaultOwnerStatus);
        } catch (error) {
          console.error('Error checking ownership:', error);
          setIsOwner(false);
          setIsDappsOwner(false);
          setIsVaultOwner(false);
        } finally {
          setCheckingOwner(false);
        }
      } else {
        setIsOwner(false);
        setIsDappsOwner(false);
        setIsVaultOwner(false);
        setCheckingOwner(false);
      }
    };

    checkOwnership();
  }, [isWalletConnected, walletAddress, checkIsOwner, vaultOwnerStatus]);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    setIsWalletConnected(true);
    setIsWalletModalOpen(false);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
    setIsOwner(false);
    setIsDappsOwner(false);
    setIsVaultOwner(false);
    setCheckingOwner(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'trade':
        return <Trade
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          onWalletConnect={() => setIsWalletModalOpen(true)}
        />;
      case 'dapps':
        return <Dapps
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          setActiveView={setActiveView}
          onWalletConnect={() => setIsWalletModalOpen(true)}
        />;
      case 'roadmap':
        return <Roadmap />;
      case 'defi':
        return <Defi
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          onWalletConnect={() => setIsWalletModalOpen(true)}
        />;
      case 'stakingHistory':
        return <StakingHistory
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          setActiveView={setActiveView}
          onWalletConnect={() => setIsWalletModalOpen(true)}
        />;
      case 'admin':
        return (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto space-y-12">
              {/* DApps Staking Admin Panel */}
              {isDappsOwner && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">DApps Staking Admin</h2>
                  <AdminPanel
                    isWalletConnected={isWalletConnected}
                    walletAddress={walletAddress}
                    isOwner={isDappsOwner}
                    checkingOwner={checkingOwner}
                    onWalletConnect={() => setIsWalletModalOpen(true)}
                  />
                </div>
              )}

              {/* Vault Staking Admin Panel */}
              {isVaultOwner && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Vault Staking Admin</h2>
                  <VaultAdminPanel
                    isWalletConnected={isWalletConnected}
                    walletAddress={walletAddress}
                    isOwner={isVaultOwner}
                    onWalletConnect={() => setIsWalletModalOpen(true)}
                  />
                </div>
              )}

              {/* No Access */}
              {!isDappsOwner && !isVaultOwner && (
                <AdminPanel
                  isWalletConnected={isWalletConnected}
                  walletAddress={walletAddress}
                  isOwner={false}
                  checkingOwner={checkingOwner}
                  onWalletConnect={() => setIsWalletModalOpen(true)}
                />
              )}
            </div>
          </div>
        );
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 transition-colors duration-300">
        <Header 
          activeView={activeView}
          setActiveView={setActiveView}
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          isOwner={isOwner}
          checkingOwner={checkingOwner}
          onWalletConnect={() => setIsWalletModalOpen(true)}
          onWalletDisconnect={handleWalletDisconnect}
        />
        
        <main className="pt-20">
          <div>
            {renderContent()}
          </div>
        </main>

        <Footer />

        <WalletModal 
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onConnect={handleWalletConnect}
        />
      </div>
  );
}

export default App;