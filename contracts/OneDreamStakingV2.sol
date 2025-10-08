// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OneDreamStaking V2
 * @notice Staking contract with simplified single referral commission system
 * @dev Admin can adjust referral commission dynamically
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract OneDreamStakingV2 {
    IERC20 public immutable oneDreamToken;
    address public owner;

    // Basis points constants (1% = 100 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_REFERRAL_COMMISSION_BASIS_POINTS = 1000; // 10% max
    uint256 public constant MAX_EARLY_UNSTAKE_FEE_BASIS_POINTS = 5000; // 50% max

    // Single referral commission rate (default 5%)
    uint256 public referralCommissionBasisPoints = 500;

    // Staking plan structure
    struct StakingPlan {
        uint256 id;
        string name;
        uint256 apyBasisPoints;
        uint256 lockDuration; // in seconds
        uint256 earlyUnstakeFeeBasisPoints;
        uint256 minStakeAmount;
        bool active;
    }

    // User stake structure
    struct Stake {
        uint256 planId;
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        address referrer;
        uint256 referralBonusClaimed; // Amount of referral bonus claimed by referrer
    }

    // State variables
    mapping(uint256 => StakingPlan) public stakingPlans;
    uint256 public nextPlanId = 1;

    mapping(address => Stake[]) public userStakes;
    mapping(address => uint256) public directReferralCounts;
    mapping(address => uint256) public referrerTotalEarnings;

    address[] private uniqueStakers;
    mapping(address => bool) private isUniqueStaker;

    // Events
    event Staked(
        address indexed user,
        uint256 planId,
        uint256 amount,
        uint256 startTime,
        address indexed referrer
    );

    event Unstaked(
        address indexed user,
        uint256 stakeIndex,
        uint256 amountReturned,
        uint256 feeAmount
    );

    event RewardsClaimed(
        address indexed user,
        uint256 stakeIndex,
        uint256 rewardAmount
    );

    event ReferralBonusClaimed(
        address indexed referrer,
        address indexed staker,
        uint256 bonusAmount
    );

    event ReferralCommissionUpdated(
        uint256 newCommission
    );

    event PlanAdded(
        uint256 indexed planId,
        string name,
        uint256 apy,
        uint256 lockDuration,
        uint256 earlyUnstakeFee,
        uint256 minStakeAmount,
        bool active
    );

    event PlanUpdated(
        uint256 indexed planId,
        string name,
        uint256 apy,
        uint256 lockDuration,
        uint256 earlyUnstakeFee,
        uint256 minStakeAmount,
        bool active
    );

    event FundsWithdrawn(address indexed to, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Constructor
    constructor(address _oneDreamTokenAddress) {
        require(_oneDreamTokenAddress != address(0), "Invalid token address");
        oneDreamToken = IERC20(_oneDreamTokenAddress);
        owner = msg.sender;
        referralCommissionBasisPoints = 500; // Default 5%
    }

    // ==================== OWNER FUNCTIONS ====================

    /**
     * @notice Set referral commission rate
     * @param _newCommissionBasisPoints New commission rate in basis points (0-1000 = 0%-10%)
     */
    function setReferralCommission(uint256 _newCommissionBasisPoints) external onlyOwner {
        require(
            _newCommissionBasisPoints <= MAX_REFERRAL_COMMISSION_BASIS_POINTS,
            "Commission exceeds maximum"
        );

        referralCommissionBasisPoints = _newCommissionBasisPoints;
        emit ReferralCommissionUpdated(_newCommissionBasisPoints);
    }

    /**
     * @notice Add a new staking plan
     */
    function addStakingPlan(
        string memory _name,
        uint256 _apyBasisPoints,
        uint256 _lockDuration,
        uint256 _earlyUnstakeFeeBasisPoints,
        uint256 _minStakeAmount,
        bool _active
    ) external onlyOwner {
        require(bytes(_name).length > 0, "Plan name cannot be empty");
        require(_minStakeAmount > 0, "Minimum stake must be greater than 0");
        require(
            _earlyUnstakeFeeBasisPoints <= MAX_EARLY_UNSTAKE_FEE_BASIS_POINTS,
            "Early unstake fee exceeds maximum"
        );

        stakingPlans[nextPlanId] = StakingPlan({
            id: nextPlanId,
            name: _name,
            apyBasisPoints: _apyBasisPoints,
            lockDuration: _lockDuration,
            earlyUnstakeFeeBasisPoints: _earlyUnstakeFeeBasisPoints,
            minStakeAmount: _minStakeAmount,
            active: _active
        });

        emit PlanAdded(
            nextPlanId,
            _name,
            _apyBasisPoints,
            _lockDuration,
            _earlyUnstakeFeeBasisPoints,
            _minStakeAmount,
            _active
        );

        nextPlanId++;
    }

    /**
     * @notice Update an existing staking plan
     */
    function updateStakingPlan(
        uint256 _planId,
        string memory _name,
        uint256 _apyBasisPoints,
        uint256 _lockDuration,
        uint256 _earlyUnstakeFeeBasisPoints,
        uint256 _minStakeAmount,
        bool _active
    ) external onlyOwner {
        require(stakingPlans[_planId].id != 0, "Plan does not exist");
        require(bytes(_name).length > 0, "Plan name cannot be empty");
        require(_minStakeAmount > 0, "Minimum stake must be greater than 0");
        require(
            _earlyUnstakeFeeBasisPoints <= MAX_EARLY_UNSTAKE_FEE_BASIS_POINTS,
            "Early unstake fee exceeds maximum"
        );

        stakingPlans[_planId].name = _name;
        stakingPlans[_planId].apyBasisPoints = _apyBasisPoints;
        stakingPlans[_planId].lockDuration = _lockDuration;
        stakingPlans[_planId].earlyUnstakeFeeBasisPoints = _earlyUnstakeFeeBasisPoints;
        stakingPlans[_planId].minStakeAmount = _minStakeAmount;
        stakingPlans[_planId].active = _active;

        emit PlanUpdated(
            _planId,
            _name,
            _apyBasisPoints,
            _lockDuration,
            _earlyUnstakeFeeBasisPoints,
            _minStakeAmount,
            _active
        );
    }

    /**
     * @notice Withdraw funds from contract (emergency function)
     * @param _amount Amount to withdraw
     * @param _to Recipient address
     */
    function withdrawFunds(uint256 _amount, address _to) external onlyOwner {
        require(_to != address(0), "Invalid recipient address");
        require(_amount <= oneDreamToken.balanceOf(address(this)), "Insufficient balance");

        require(oneDreamToken.transfer(_to, _amount), "Transfer failed");
        emit FundsWithdrawn(_to, _amount);
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        owner = newOwner;
    }

    // ==================== USER FUNCTIONS ====================

    /**
     * @notice Stake tokens
     * @param _planId The staking plan ID
     * @param _amount Amount to stake
     * @param _referrer Referrer address (optional)
     */
    function stake(
        uint256 _planId,
        uint256 _amount,
        address _referrer
    ) external {
        StakingPlan memory plan = stakingPlans[_planId];
        require(plan.id != 0, "Invalid plan");
        require(plan.active, "Plan is not active");
        require(_amount >= plan.minStakeAmount, "Amount below minimum");
        require(_referrer != msg.sender, "Cannot refer yourself");

        // Transfer tokens from user to contract
        require(
            oneDreamToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        // Track unique staker
        if (!isUniqueStaker[msg.sender]) {
            uniqueStakers.push(msg.sender);
            isUniqueStaker[msg.sender] = true;
        }

        // Create stake
        userStakes[msg.sender].push(Stake({
            planId: _planId,
            amount: _amount,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            referrer: _referrer,
            referralBonusClaimed: 0
        }));

        // Update referral count if valid referrer
        if (_referrer != address(0)) {
            directReferralCounts[_referrer]++;
        }

        emit Staked(msg.sender, _planId, _amount, block.timestamp, _referrer);
    }

    /**
     * @notice Unstake tokens
     * @param _stakeIndex Index of the stake
     */
    function unstake(uint256 _stakeIndex) external {
        require(_stakeIndex < userStakes[msg.sender].length, "Invalid stake index");

        Stake storage userStake = userStakes[msg.sender][_stakeIndex];
        StakingPlan memory plan = stakingPlans[userStake.planId];

        uint256 stakedAmount = userStake.amount;
        uint256 lockEndTime = userStake.startTime + plan.lockDuration;

        // Calculate any pending rewards first and add to amount returned
        uint256 pendingRewards = calculatePendingReward(msg.sender, _stakeIndex);

        uint256 amountToReturn = stakedAmount;
        uint256 feeAmount = 0;

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

        emit ReferralBonusClaimed(msg.sender, _staker, bonusAmount);
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
}