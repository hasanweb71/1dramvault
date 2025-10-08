import React, { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Trade from './components/Trade';
import Dapps from './components/Dapps';
import Roadmap from './components/Roadmap';
import Defi from './components/Defi';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import WalletModal from './components/WalletModal';
import StakingHistory from './components/StakingHistory';
import { useStakingData } from './hooks/useStakingData';

type ActiveView = 'home' | 'trade' | 'dapps' | 'roadmap' | 'defi' | 'stakingHistory';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(false);

  const { checkIsOwner } = useStakingData();

  // Check if connected wallet is contract owner
  React.useEffect(() => {
    const checkOwnership = async () => {
      if (isWalletConnected && walletAddress) {
        setCheckingOwner(true);
        try {
          const ownerStatus = await checkIsOwner(walletAddress);
          setIsOwner(ownerStatus);
        } catch (error) {
          console.error('Error checking ownership:', error);
          setIsOwner(false);
        } finally {
          setCheckingOwner(false);
        }
      } else {
        setIsOwner(false);
        setCheckingOwner(false);
      }
    };

    checkOwnership();
  }, [isWalletConnected, walletAddress, checkIsOwner]);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    setIsWalletConnected(true);
    setIsWalletModalOpen(false);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
    setIsOwner(false);
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
        return <AdminPanel
          isWalletConnected={isWalletConnected}
          walletAddress={walletAddress}
          isOwner={isOwner}
          checkingOwner={checkingOwner}
          onWalletConnect={() => setIsWalletModalOpen(true)}
        />;
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