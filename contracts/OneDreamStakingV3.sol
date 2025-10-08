mount = 0;

        // Apply early unstake fee if still locked
        if (block.timestamp < lockEndTime && plan.lockDuration > 0) {
            feeAmount = (stakedAmount * plan.earlyUnstakeFeeBasisPoints) / BASIS_POINTS;
            amountToReturn = stakedAmount - feeAmount;
        }

        // Add pending rewards to return amount
        amountToReturn += pendingRewards;

        // Remove stake by swapping with last element and popping
        uint256 lastIndex = userStakes[msg.sender].length - 1;
        if (_stakeIndex != lastIndex) {
            userStakes[msg.sender][_stakeIndex] = userStakes[msg.sender][lastIndex];
        }
        userStakes[msg.sender].pop();

        // Transfer tokens back to user from contract balance
        require(oneDreamToken.transfer(msg.sender, amountToReturn), "Transfer failed");

        emit Unstaked(msg.sender, _stakeIndex, amountToReturn, feeAmount);
    }

    /**
     * @notice Claim staking rewards
     * @param _stakeIndex Index of the stake
     */
    function claimRewards(uint256 _stakeIndex) external {
        require(_stakeIndex < userStakes[msg.sender].length, "Invalid stake index");

        uint256 pendingReward = calculatePendingReward(msg.sender, _stakeIndex);
        require(pendingReward > 0, "No rewards to claim");

        // Update last claim time
        userStakes[msg.sender][_stakeIndex].lastClaimTime = block.timestamp;

        // Transfer rewards to user from contract balance
        require(oneDreamToken.transfer(msg.sender, pendingReward), "Transfer failed");

        emit RewardsClaimed(msg.sender, _stakeIndex, pendingReward);
    }

    /**
     * @notice Claim referral bonus
     * @param _staker Address of the staker who was referred
     * @param _stakeIndex Index of the stake
     */
    function claimReferralBonus(address _staker, uint256 _stakeIndex) external {
        require(_stakeIndex < userStakes[_staker].length, "Invalid stake index");

        Stake storage stake = userStakes[_staker][_stakeIndex];
        require(stake.referrer == msg.sender, "You are not the referrer");

        // Check if already claimed
        require(stake.referralBonusClaimed == 0, "Bonus already claimed");

        // Calculate bonus using current commission rate
        uint256 bonusAmount = (stake.amount * referralCommissionBasisPoints) / BASIS_POINTS;

        // Mark as claimed
        stake.referralBonusClaimed = bonusAmount;

        // Update referrer total earnings
        referrerTotalEarnings[msg.sender] += bonusAmount;

        // Transfer bonus to referrer from contract balance
        require(oneDreamToken.transfer(msg.sender, bonusAmount), "Transfer failed");

        // V3 UPDATED: Emit event with stakeIndex
        emit ReferralBonusClaimed(msg.sender, _staker, _stakeIndex, bonusAmount);
    }

    // ==================== VIEW FUNCTIONS ====================

    /**
     * @notice Calculate pending rewards for a stake
     */
    function calculatePendingReward(address _user, uint256 _stakeIndex) public view returns (uint256) {
        if (_stakeIndex >= userStakes[_user].length) {
            return 0;
        }

        Stake memory userStake = userStakes[_user][_stakeIndex];
        StakingPlan memory plan = stakingPlans[userStake.planId];

        uint256 timeElapsed = block.timestamp - userStake.lastClaimTime;

        // Calculate rewards: (amount * APY * timeElapsed) / (365 days * 100%)
        uint256 reward = (userStake.amount * plan.apyBasisPoints * timeElapsed)
                        / (365 days * BASIS_POINTS);

        return reward;
    }

    /**
     * @notice Get all active staking plans
     */
    function getActiveStakingPlans() external view returns (StakingPlan[] memory) {
        uint256 activeCount = 0;

        // Count active plans
        for (uint256 i = 1; i < nextPlanId; i++) {
            if (stakingPlans[i].active) {
                activeCount++;
            }
        }

        // Create array of active plans
        StakingPlan[] memory activePlans = new StakingPlan[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < nextPlanId; i++) {
            if (stakingPlans[i].active) {
                activePlans[currentIndex] = stakingPlans[i];
                currentIndex++;
            }
        }

        return activePlans;
    }

    /**
     * @notice Get a specific staking plan
     */
    function getStakingPlan(uint256 _planId) external view returns (
        uint256 id,
        string memory name,
        uint256 apyBasisPoints,
        uint256 lockDuration,
        uint256 earlyUnstakeFeeBasisPoints,
        uint256 minStakeAmount,
        bool active
    ) {
        StakingPlan memory plan = stakingPlans[_planId];
        return (
            plan.id,
            plan.name,
            plan.apyBasisPoints,
            plan.lockDuration,
            plan.earlyUnstakeFeeBasisPoints,
            plan.minStakeAmount,
            plan.active
        );
    }

    /**
     * @notice Get user's stake at specific index
     */
    function getUserStake(address _user, uint256 _stakeIndex) external view returns (
        uint256 planId,
        uint256 amount,
        uint256 startTime,
        uint256 lastClaimTime,
        address referrer,
        uint256 referralBonusClaimed
    ) {
        require(_stakeIndex < userStakes[_user].length, "Invalid stake index");
        Stake memory userStake = userStakes[_user][_stakeIndex];
        return (
            userStake.planId,
            userStake.amount,
            userStake.startTime,
            userStake.lastClaimTime,
            userStake.referrer,
            userStake.referralBonusClaimed
        );
    }

    /**
     * @notice Get all user stakes
     */
    function getAllUserStakes(address _user) external view returns (Stake[] memory) {
        return userStakes[_user];
    }

    /**
     * @notice Get user's stake count
     */
    function getUserStakeCount(address _user) external view returns (uint256) {
        return userStakes[_user].length;
    }

    /**
     * @notice Get user's total staked amount
     */
    function getUserTotalStakedAmount(address _user) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < userStakes[_user].length; i++) {
            total += userStakes[_user][i].amount;
        }
        return total;
    }

    /**
     * @notice Get direct referral count for a user
     */
    function getDirectReferralCount(address _user) external view returns (uint256) {
        return directReferralCounts[_user];
    }

    /**
     * @notice Get referrer's total earnings
     */
    function getReferrerTotalEarnings(address _referrer) external view returns (uint256) {
        return referrerTotalEarnings[_referrer];
    }

    /**
     * @notice Get total number of unique stakers
     */
    function getTotalUniqueStakers() external view returns (uint256) {
        return uniqueStakers.length;
    }

    /**
     * @notice Get contract's token balance
     */
    function getContractTokenBalance() external view returns (uint256) {
        return oneDreamToken.balanceOf(address(this));
    }

    /**
     * @notice Get total number of staking plans
     */
    function getStakingPlanCount() external view returns (uint256) {
        return nextPlanId - 1;
    }

    /**
     * @notice V3 NEW: Get all claimable referral bonuses for a referrer
     * @dev This allows frontend to calculate total claimable amount without events
     */
    function getClaimableReferralBonuses(address _referrer) external view returns (
        address[] memory stakers,
        uint256[] memory stakeIndexes,
        uint256[] memory bonusAmounts
    ) {
        // First pass: count claimable bonuses
        uint256 claimableCount = 0;

        for (uint256 i = 0; i < uniqueStakers.length; i++) {
            address staker = uniqueStakers[i];
            uint256 stakeCount = userStakes[staker].length;

            for (uint256 j = 0; j < stakeCount; j++) {
                Stake memory stake = userStakes[staker][j];
                if (stake.referrer == _referrer && stake.referralBonusClaimed == 0) {
                    claimableCount++;
                }
            }
        }

        // Second pass: fill arrays
        stakers = new address[](claimableCount);
        stakeIndexes = new uint256[](claimableCount);
        bonusAmounts = new uint256[](claimableCount);

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < uniqueStakers.length; i++) {
            address staker = uniqueStakers[i];
            uint256 stakeCount = userStakes[staker].length;

            for (uint256 j = 0; j < stakeCount; j++) {
                Stake memory stake = userStakes[staker][j];
                if (stake.referrer == _referrer && stake.referralBonusClaimed == 0) {
                    stakers[currentIndex] = staker;
                    stakeIndexes[currentIndex] = j;
                    bonusAmounts[currentIndex] = (stake.amount * referralCommissionBasisPoints) / BASIS_POINTS;
                    currentIndex++;
                }
            }
        }

        return (stakers, stakeIndexes, bonusAmounts);
    }

    /**
     * @notice V3 NEW: Get total claimable referral amount for a referrer
     */
    function getTotalClaimableReferralAmount(address _referrer) external view returns (uint256) {
        uint256 totalClaimable = 0;

        for (uint256 i = 0; i < uniqueStakers.length; i++) {
            address staker = uniqueStakers[i];
            uint256 stakeCount = userStakes[staker].length;

            for (uint256 j = 0; j < stakeCount; j++) {
                Stake memory stake = userStakes[staker][j];
                if (stake.referrer == _referrer && stake.referralBonusClaimed == 0) {
                    totalClaimable += (stake.amount * referralCommissionBasisPoints) / BASIS_POINTS;
                }
            }
        }

        return totalClaimable;
    }
}
