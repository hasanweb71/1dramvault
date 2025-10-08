import React from 'react';
import { Shield, Plus, CreditCard as Edit, Save, X, AlertCircle, CheckCircle, RefreshCw, Settings, Lock, Zap, Users } from 'lucide-react';
import { useStakingData } from '../hooks/useStakingData';

interface AddStakingPlanData {
  name: string;
  apyPercentage: number;
  lockDurationDays: number;
  minStakeAmount: number;
  earlyUnstakeFeePercentage: number;
  active: boolean;
}

interface ReferralTierFormData {
  minReferrals: number;
  commissionPercentage: number;
}

interface AdminPanelProps {
  isWalletConnected: boolean;
  walletAddress: string;
  isOwner: boolean;
  checkingOwner: boolean;
  onWalletConnect: () => void;
}

export default function AdminPanel({ isWalletConnected, walletAddress, isOwner, checkingOwner, onWalletConnect }: AdminPanelProps) {
  const {
    stakingPlans,
    stakingStats,
    referralCommissionBasisPoints,
    loading,
    error,
    refresh,
    addStakingPlan,
    updateStakingPlan,
    setReferralCommission
  } = useStakingData();

  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [submitSuccess, setSubmitSuccess] = React.useState('');
  const [newCommissionPercentage, setNewCommissionPercentage] = React.useState<number>(5);
  const [isUpdatingCommission, setIsUpdatingCommission] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState<AddStakingPlanData>({
    name: '',
    apyPercentage: 0,
    lockDurationDays: 0,
    minStakeAmount: 100,
    earlyUnstakeFeePercentage: 0,
    active: true
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      apyPercentage: 0,
      lockDurationDays: 0,
      minStakeAmount: 100,
      earlyUnstakeFeePercentage: 0,
      active: true
    });
    setShowAddForm(false);
    setEditingPlan(null);
    setSubmitError('');
    setSubmitSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setSubmitError('Plan name is required');
      return;
    }

    if (formData.apyPercentage <= 0 || formData.apyPercentage > 1000) {
      setSubmitError('APY must be between 0.01% and 1000%');
      return;
    }

    if (formData.minStakeAmount <= 0) {
      setSubmitError('Minimum stake amount must be greater than 0');
      return;
    }

    if (formData.earlyUnstakeFeePercentage < 0 || formData.earlyUnstakeFeePercentage > 50) {
      setSubmitError('Early unstake fee must be between 0% and 50%');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      let success = false;
      
      if (editingPlan !== null) {
        success = await updateStakingPlan(editingPlan, formData);
        if (success) {
          setSubmitSuccess('Staking plan updated successfully!');
        }
      } else {
        success = await addStakingPlan(formData);
        if (success) {
          setSubmitSuccess('Staking plan added successfully!');
        }
      }

      if (success) {
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        setSubmitError('Failed to save staking plan. Please try again.');
      }
    } catch (err) {
      setSubmitError('An error occurred while saving the plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle commission update
  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newCommissionPercentage <= 0 || newCommissionPercentage > 10) {
      setSubmitError('Commission must be between 0.01% and 10%');
      return;
    }

    setIsUpdatingCommission(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const commissionBasisPoints = Math.floor(newCommissionPercentage * 100);
      const success = await setReferralCommission(commissionBasisPoints);

      if (success) {
        setSubmitSuccess('Referral commission updated successfully!');
      } else {
        setSubmitError('Failed to update referral commission. Please try again.');
      }
    } catch (err) {
      setSubmitError('An error occurred while updating the commission.');
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  // Handle edit plan
  const handleEditPlan = (plan: any) => {
    setFormData({
      name: plan.name,
      apyPercentage: plan.apyBasisPoints / 100,
      lockDurationDays: plan.lockDuration / (24 * 60 * 60),
      minStakeAmount: parseFloat(plan.minStake.replace(/[^\d.]/g, '')),
      earlyUnstakeFeePercentage: plan.earlyUnstakeFeeBasisPoints / 100,
      active: plan.active
    });
    setEditingPlan(plan.id);
    setShowAddForm(true);
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-4">Admin Panel</h1>
          <p className="text-xl text-slate-400 dark:text-slate-400 light:text-gray-600">Manage staking plans and platform settings</p>
        </div>

        {/* Wallet Connection Check */}
        {!isWalletConnected ? (
          <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100 text-center">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-4">Wallet Required</h2>
            <p className="text-slate-400 dark:text-slate-400 light:text-gray-600 mb-6">
              Connect your wallet to access the admin panel
            </p>
            <button
              onClick={onWalletConnect}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              Connect Wallet
            </button>
          </div>
        ) : checkingOwner ? (
          <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100 text-center">
            <RefreshCw className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-4">Verifying Access</h2>
            <p className="text-slate-400 dark:text-slate-400 light:text-gray-600">
              Checking admin permissions...
            </p>
          </div>
        ) : !isOwner ? (
          <div className="bg-red-900/20 dark:bg-red-900/20 light:bg-red-50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-700/50 dark:border-red-700/50 light:border-red-200 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-4">Access Denied</h2>
            <p className="text-slate-400 dark:text-slate-400 light:text-gray-600 mb-4">
              Only the contract owner can access this admin panel.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 light:text-gray-500">
              Connected: {formatAddress(walletAddress)}
            </p>
          </div>
        ) : (
          <>
            {/* Admin Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">Total Plans</h3>
                  <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
                  {loading ? (
                    <div className="h-9 w-16 bg-slate-700/50 animate-pulse rounded"></div>
                  ) : (
                    stakingPlans.length
                  )}
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">Active staking plans</p>
              </div>

              <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">Total Staked</h3>
                  <Lock className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
                  {loading ? (
                    <div className="h-9 w-24 bg-slate-700/50 animate-pulse rounded"></div>
                  ) : (
                    stakingStats.totalStaked
                  )}
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">1DREAM tokens</p>
              </div>

              <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">Total Stakers</h3>
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
                  {loading ? (
                    <div className="h-9 w-16 bg-slate-700/50 animate-pulse rounded"></div>
                  ) : (
                    stakingStats.totalStakers
                  )}
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">Unique users</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Staking Plan</span>
                </button>
                
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="bg-slate-700/50 dark:bg-slate-700/50 light:bg-gray-100 border border-slate-600 dark:border-slate-600 light:border-gray-300 text-slate-300 dark:text-slate-300 light:text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 dark:bg-red-900/20 light:bg-red-50 border border-red-700/50 dark:border-red-700/50 light:border-red-200 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 dark:text-red-400 light:text-red-600">{error}</p>
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">
                    {editingPlan !== null ? 'Edit Staking Plan' : 'Add New Staking Plan'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-gray-500 light:hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-900/20 dark:bg-green-900/20 light:bg-green-50 border border-green-700/50 dark:border-green-700/50 light:border-green-200 rounded-xl flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 dark:text-green-400 light:text-green-600">{submitSuccess}</p>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 bg-red-900/20 dark:bg-red-900/20 light:bg-red-50 border border-red-700/50 dark:border-red-700/50 light:border-red-200 rounded-xl flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 dark:text-red-400 light:text-red-600">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plan Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-700 mb-2">
                        Plan Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Flexible Staking"
                        className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 light:bg-white border border-slate-600 dark:border-slate-600 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-gray-500"
                        required
                      />
                    </div>

                    {/* APY Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-700 mb-2">
                        APY (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="1000"
                        value={formData.apyPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, apyPercentage: parseFloat(e.target.value) || 0 }))}
                        placeholder="e.g., 8.5"
                        className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 light:bg-white border border-slate-600 dark:border-slate-600 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-gray-500"
                        required
                      />
                    </div>

                    {/* Lock Duration */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-700 mb-2">
                        Lock Duration (Days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="3650"
                        value={formData.lockDurationDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, lockDurationDays: parseInt(e.target.value) || 0 }))}
                        placeholder="e.g., 90 (0 for flexible)"
                        className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 light:bg-white border border-slate-600 dark:border-slate-600 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-gray-500"
                      />
                    </div>

                    {/* Minimum Stake Amount */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-700 mb-2">
                        Minimum Stake Amount (1DREAM) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minStakeAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, minStakeAmount: parseFloat(e.target.value) || 100 }))}
                        placeholder="e.g., 100"
                        className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 light:bg-white border border-slate-600 dark:border-slate-600 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-gray-500"
                        required
                      />
                    </div>

                    {/* Early Unstake Fee */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-700 mb-2">
                        Early Unstake Fee (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="50"
                        value={formData.earlyUnstakeFeePercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, earlyUnstakeFeePercentage: parseFloat(e.target.value) || 0 }))}
                        placeholder="e.g., 12 (0 for no fee)"
                        className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 light:bg-white border border-slate-600 dark:border-slate-600 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-gray-500"
                      />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="active"
                        checked={formData.active}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="active" className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-700">
                        Active Plan
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700/50 dark:border-slate-700/50 light:border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-slate-600 dark:border-slate-600 light:border-gray-300 text-slate-300 dark:text-slate-300 light:text-gray-600 rounded-xl font-medium hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-100 transition-all duration-200"
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
                          <span>{editingPlan !== null ? 'Updating...' : 'Adding...'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>{editingPlan !== null ? 'Update Plan' : 'Add Plan'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Referral Commission Management */}
            <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">Referral Commission</h2>
                <Settings className="w-6 h-6 text-blue-600" />
              </div>

              <div className="bg-blue-900/20 dark:bg-blue-900/20 light:bg-blue-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">Current Rate</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">All direct referrals earn this commission</p>
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    {(referralCommissionBasisPoints / 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Commission Update Form */}
              <div className="bg-slate-700/30 dark:bg-slate-700/30 light:bg-gray-50 rounded-xl p-6">
                <h4 className="font-medium text-white dark:text-white light:text-gray-900 mb-4">Update Commission Rate</h4>
                <form onSubmit={handleUpdateCommission} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-700 mb-2">
                      New Commission Percentage (0.1% - 10%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={newCommissionPercentage}
                      onChange={(e) => setNewCommissionPercentage(parseFloat(e.target.value) || 5)}
                      placeholder="e.g., 7.5"
                      className="w-full px-4 py-3 bg-slate-700/50 dark:bg-slate-700/50 light:bg-white border border-slate-600 dark:border-slate-600 light:border-gray-300 text-white dark:text-white light:text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-gray-500"
                      required
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600 mt-2">
                      Current: {(referralCommissionBasisPoints / 100).toFixed(1)}% | Entering 5.0 = 5% commission
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingCommission}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isUpdatingCommission ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Update Commission</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Existing Plans */}
            <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-white backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 dark:border-slate-700/50 light:border-gray-200">
                <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">Existing Staking Plans</h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-400 dark:text-slate-400 light:text-gray-600">Loading staking plans...</p>
                  <p className="text-xs text-slate-500 mt-2">Fetching data from blockchain</p>
                </div>
              ) : stakingPlans.length === 0 ? (
                <div className="p-8 text-center">
                  <Zap className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 dark:text-slate-400 light:text-gray-600 mb-4">No staking plans found</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                  >
                    Add Your First Plan
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/30 dark:bg-slate-700/30 light:bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-gray-700">Plan Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-gray-700">APY</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-gray-700">Lock Period</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-gray-700">Min Stake</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-gray-700">Early Fee</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 dark:divide-slate-700/50 light:divide-gray-200">
                      {stakingPlans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-slate-700/20 dark:hover:bg-slate-700/20 light:hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-white dark:text-white light:text-gray-900">{plan.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-green-400 font-semibold">{plan.apy}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white dark:text-white light:text-gray-900">{plan.lockPeriod}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white dark:text-white light:text-gray-900">{plan.minStake} 1DREAM</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white dark:text-white light:text-gray-900">{plan.earlyUnstakeFee}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              plan.active 
                                ? 'bg-green-400/20 text-green-400' 
                                : 'bg-red-400/20 text-red-400'
                            }`}>
                              {plan.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleEditPlan(plan)}
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
          </>
        )}
      </div>
    </div>
  );
}