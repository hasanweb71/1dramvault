import React, { useState } from 'react';
import { Shield, Plus, Edit, Save, X, AlertCircle, CheckCircle, RefreshCw, Settings, DollarSign, Package } from 'lucide-react';
import { useVaultStaking } from '../hooks/useVaultStaking';
import { ethers } from 'ethers';

interface VaultAdminPanelProps {
  isWalletConnected: boolean;
  walletAddress: string;
  isOwner: boolean;
  onWalletConnect: () => void;
}

interface PackageFormData {
  name: string;
  minAmount: string;
  maxAmount: string;
  dailyRate: string;
  baseDuration: string;
  referralBonus: string;
  closingBonus: string;
}

export default function VaultAdminPanel({ isWalletConnected, walletAddress, isOwner, onWalletConnect }: VaultAdminPanelProps) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // Initialize provider and signer when wallet connects
  React.useEffect(() => {
    const initProvider = async () => {
      if (isWalletConnected && window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const browserSigner = await browserProvider.getSigner();
        setProvider(browserProvider);
        setSigner(browserSigner);
      } else {
        setProvider(null);
        setSigner(null);
      }
    };

    initProvider();
  }, [isWalletConnected]);

  const {
    packages,
    contractStats,
    loading,
    error,
    createPackage,
    updatePackage,
    withdrawUsdt,
    refresh
  } = useVaultStaking(walletAddress, signer || undefined);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    minAmount: '',
    maxAmount: '',
    dailyRate: '1',
    baseDuration: '120',
    referralBonus: '4',
    closingBonus: '5'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      minAmount: '',
      maxAmount: '',
      dailyRate: '1',
      baseDuration: '120',
      referralBonus: '4',
      closingBonus: '5'
    });
    setShowAddForm(false);
    setEditingPackage(null);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setSubmitError('Package name is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const dailyRateBP = Math.floor(parseFloat(formData.dailyRate) * 100);
      const closingBonusBP = Math.floor(parseFloat(formData.closingBonus) * 100);

      if (editingPackage !== null) {
        const pkg = packages.find(p => p.id === editingPackage);
        await updatePackage(
          editingPackage,
          formData.name,
          formData.minAmount,
          formData.maxAmount,
          dailyRateBP,
          parseInt(formData.baseDuration),
          parseInt(formData.referralBonus),
          closingBonusBP,
          pkg?.active || true
        );
        setSubmitSuccess('Package updated successfully!');
      } else {
        await createPackage(
          formData.name,
          formData.minAmount,
          formData.maxAmount,
          dailyRateBP,
          parseInt(formData.baseDuration),
          parseInt(formData.referralBonus),
          closingBonusBP
        );
        setSubmitSuccess('Package created successfully!');
      }

      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPackage = (pkg: any) => {
    setFormData({
      name: pkg.name,
      minAmount: pkg.minAmount,
      maxAmount: pkg.maxAmount,
      dailyRate: (pkg.dailyRateBasisPoints / 100).toString(),
      baseDuration: pkg.baseDurationDays.toString(),
      referralBonus: pkg.referralBonusDays.toString(),
      closingBonus: (pkg.closingBonusBasisPoints / 100).toString()
    });
    setEditingPackage(pkg.id);
    setShowAddForm(true);
  };

  const handleWithdrawUsdt = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setSubmitError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await withdrawUsdt(withdrawAmount);
      setSubmitSuccess(`Successfully withdrawn ${withdrawAmount} USDT`);
      setWithdrawAmount('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to withdraw USDT');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 text-center">
        <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
        <p className="text-slate-400 mb-6">Connect your wallet to access the vault admin panel</p>
        <button
          onClick={onWalletConnect}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-700/50 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-slate-400 mb-4">Only the vault contract owner can access this admin panel.</p>
        <p className="text-sm text-slate-500">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Vault Admin Panel</h2>
        <p className="text-slate-400">Manage staking packages and withdrawals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Total USDT</h3>
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {loading ? (
              <div className="h-9 w-24 bg-slate-700/50 animate-pulse rounded"></div>
            ) : (
              `${parseFloat(contractStats?.totalUsdtStaked || '0').toLocaleString()} USDT`
            )}
          </div>
          <p className="text-sm text-slate-400">Total staked</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Packages</h3>
            <Package className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {loading ? (
              <div className="h-9 w-16 bg-slate-700/50 animate-pulse rounded"></div>
            ) : (
              packages.length
            )}
          </div>
          <p className="text-sm text-slate-400">Active packages</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Contract Balance</h3>
            <DollarSign className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {loading ? (
              <div className="h-9 w-24 bg-slate-700/50 animate-pulse rounded"></div>
            ) : (
              `${parseFloat(contractStats?.usdtBalance || '0').toLocaleString()} USDT`
            )}
          </div>
          <p className="text-sm text-slate-400">Available to withdraw</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Package</span>
        </button>

        <button
          onClick={refresh}
          disabled={loading}
          className="bg-slate-700/50 border border-slate-600 text-slate-300 px-6 py-3 rounded-xl font-medium hover:bg-slate-700 transition-all duration-200 flex items-center space-x-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Add/Edit Package Form */}
      {showAddForm && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {editingPackage !== null ? 'Edit Package' : 'Add New Package'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400">{submitSuccess}</p>
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Package Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bronze"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Daily Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: e.target.value }))}
                  placeholder="e.g., 1"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Min Amount (USDT) *</label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minAmount: e.target.value }))}
                  placeholder="e.g., 100"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Max Amount (USDT) *</label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: e.target.value }))}
                  placeholder="e.g., 500"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Base Duration (Days) *</label>
                <input
                  type="number"
                  value={formData.baseDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, baseDuration: e.target.value }))}
                  placeholder="e.g., 120"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Referral Bonus (Days) *</label>
                <input
                  type="number"
                  value={formData.referralBonus}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralBonus: e.target.value }))}
                  placeholder="e.g., 4"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Closing Bonus (%) *</label>
                <input
                  type="number"
                  step="1"
                  value={formData.closingBonus}
                  onChange={(e) => setFormData(prev => ({ ...prev, closingBonus: e.target.value }))}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700/50">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl font-medium hover:bg-slate-700/50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{editingPackage !== null ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingPackage !== null ? 'Update Package' : 'Create Package'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USDT Withdrawal */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50">
        <h3 className="text-2xl font-bold text-white mb-6">Withdraw USDT</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Amount (USDT)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-2">
              Available: {parseFloat(contractStats?.usdtBalance || '0').toLocaleString()} USDT
            </p>
          </div>
          <button
            onClick={handleWithdrawUsdt}
            disabled={isSubmitting || !withdrawAmount}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-xl font-medium hover:from-amber-700 hover:to-amber-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Withdraw USDT'}
          </button>
        </div>
      </div>

      {/* Package List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-2xl font-bold text-white">Staking Packages</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-slate-400">Loading packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No packages found</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              Add Your First Package
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount Range</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Daily Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Referral Bonus</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Closing Bonus</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{pkg.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">${parseFloat(pkg.minAmount).toLocaleString()} - ${parseFloat(pkg.maxAmount).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-green-400 font-semibold">{pkg.dailyRate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{pkg.baseDurationDays} days</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-blue-400">+{pkg.referralBonusDays} days</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-purple-400">{pkg.closingBonusRate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-400/10 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
