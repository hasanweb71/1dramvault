// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

interface IPancakeSwapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

/**
 * @title OneDreamVaultStaking
 * @notice USDT staking vault that rewards users with 1Dream tokens based on PancakeSwap price
 * @dev Features:
 * - Stake USDT, earn 1Dream tokens
 * - Daily rewards based on package rate and 1Dream price from PancakeSwap
 * - Referral system: earn additional staking days per successful referral
 * - Re-staking bonus: 8% bonus in 1Dream tokens after re-stake period ends
 * - No USDT unstaking - all USDT stays in contract until owner withdrawal
 * - One package per wallet at a time
 * - Cannot re-stake until current period (including referral bonus days) ends
 */
contract OneDreamVaultStaking {
    // ==================== STATE VARIABLES ====================

    address public owner;
    IERC20 public usdtToken;
    IERC20 public oneDreamToken;
    IPancakeSwapV2Pair public pancakeSwapPair; // 1Dream/USDT pair

    bool public token0IsOneDream; // true if token0 is 1Dream, false if token1 is 1Dream

    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000
    uint256 public constant RESTAKE_BONUS_BP = 800; // 8% = 800 basis points

    uint256 public nextPackageId = 1;

    // Package structure
    struct StakingPackage {
        uint256 id;
        string name;
        uint256 minAmount; // Minimum USDT amount (with decimals)
        uint256 maxAmount; // Maximum USDT amount (with decimals)
        uint256 dailyRateBasisPoints; // Daily reward rate in basis points (1% = 100)
        uint256 baseDurationDays; // Base duration in days
        uint256 referralBonusDays; // Days added per successful referral
        bool active;
    }

    // Stake structure
    struct UserStake {
        uint256 packageId;
        uint256 usdtAmount; // Amount of USDT staked
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 baseDurationDays;
        uint256 referralCount; // Number of referrals made
        uint256 totalDurationDays; // Base + (referralCount * referralBonusDays)
        uint256 restakeCount; // Number of times this wallet has re-staked
        uint256 restakeBonus; // 8% bonus accumulated, claimable after period ends
        bool restakeBonusClaimed; // Whether re-stake bonus has been claimed
        address referrer; // Who referred this user
    }

    // Mappings
    mapping(uint256 => StakingPackage) public packages;
    mapping(address => UserStake) public userStakes;
    mapping(address => bool) public hasActiveStake;
    mapping(address => uint256) public totalReferrals; // Total referrals per user
    mapping(address => address[]) public referredUsers; // List of users referred by an address

    // Stats
    uint256 public totalUsdtStaked;
    uint256 public totalStakers;
    uint256 public totalRewardsPaid;
    address[] public allStakers;

    // ==================== EVENTS ====================

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event PackageCreated(uint256 indexed packageId, string name, uint256 minAmount, uint256 maxAmount, uint256 dailyRate, uint256 baseDuration, uint256 referralBonus);
    event PackageUpdated(uint256 indexed packageId, bool active);
    event Staked(address indexed user, uint256 indexed packageId, uint256 usdtAmount, address indexed referrer);
    event RewardsClaimed(address indexed user, uint256 oneDreamAmount);
    event RestakeBonusClaimed(address indexed user, uint256 bonusAmount);
    event ReferralAdded(address indexed referrer, address indexed referee, uint256 bonusDays);
    event UsdtWithdrawn(address indexed owner, uint256 amount);
    event OneDreamWithdrawn(address indexed owner, uint256 amount);
    event PancakeSwapPairUpdated(address indexed newPair, bool token0IsOneDream);

    // ==================== MODIFIERS ====================

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // ==================== CONSTRUCTOR ====================

    constructor(
        address _usdtToken,
        address _oneDreamToken,
        address _pancakeSwapPair
    ) {
        require(_usdtToken != address(0), "Invalid USDT address");
        require(_oneDreamToken != address(0), "Invalid OneDream address");
        require(_pancakeSwapPair != address(0), "Invalid PancakeSwap pair address");

        owner = msg.sender;
        usdtToken = IERC20(_usdtToken);
        oneDreamToken = IERC20(_oneDreamToken);
        pancakeSwapPair = IPancakeSwapV2Pair(_pancakeSwapPair);

        // Determine which token is OneDream in the pair
        token0IsOneDream = (pancakeSwapPair.token0() == _oneDreamToken);

        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ==================== OWNER FUNCTIONS ====================

    /**
     * @notice Transfer ownership to a new address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Create a new staking package
     */
    function createPackage(
        string memory _name,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _dailyRateBasisPoints,
        uint256 _baseDurationDays,
        uint256 _referralBonusDays
    ) external onlyOwner {
        require(_minAmount > 0 && _maxAmount >= _minAmount, "Invalid amount range");
        require(_dailyRateBasisPoints > 0 && _dailyRateBasisPoints <= 1000, "Invalid daily rate"); // Max 10% daily
        require(_baseDurationDays > 0, "Duration must be positive");

        uint256 packageId = nextPackageId++;

        packages[packageId] = StakingPackage({
            id: packageId,
            name: _name,
            minAmount: _minAmount,
            maxAmount: _maxAmount,
            dailyRateBasisPoints: _dailyRateBasisPoints,
            baseDurationDays: _baseDurationDays,
            referralBonusDays: _referralBonusDays,
            active: true
        });

        emit PackageCreated(packageId, _name, _minAmount, _maxAmount, _dailyRateBasisPoints, _baseDurationDays, _referralBonusDays);
    }

    /**
     * @notice Update package details
     */
    function updatePackage(
        uint256 _packageId,
        string memory _name,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _dailyRateBasisPoints,
        uint256 _baseDurationDays,
        uint256 _referralBonusDays,
        bool _active
    ) external onlyOwner {
        require(packages[_packageId].id == _packageId, "Package does not exist");
        require(_minAmount > 0 && _maxAmount >= _minAmount, "Invalid amount range");
        require(_dailyRateBasisPoints > 0 && _dailyRateBasisPoints <= 1000, "Invalid daily rate");
        require(_baseDurationDays > 0, "Duration must be positive");

        StakingPackage storage pkg = packages[_packageId];
        pkg.name = _name;
        pkg.minAmount = _minAmount;
        pkg.maxAmount = _maxAmount;
        pkg.dailyRateBasisPoints = _dailyRateBasisPoints;
        pkg.baseDurationDays = _baseDurationDays;
        pkg.referralBonusDays = _referralBonusDays;
        pkg.active = _active;

        emit PackageUpdated(_packageId, _active);
    }

    /**
     * @notice Toggle package active status
     */
    function setPackageActive(uint256 _packageId, bool _active) external onlyOwner {
        require(packages[_packageId].id == _packageId, "Package does not exist");
        packages[_packageId].active = _active;
        emit PackageUpdated(_packageId, _active);
    }

    /**
     * @notice Update PancakeSwap pair address
     */
    function updatePancakeSwapPair(address _newPair) external onlyOwner {
        require(_newPair != address(0), "Invalid pair address");
        pancakeSwapPair = IPancakeSwapV2Pair(_newPair);

        // Update token order
        token0IsOneDream = (pancakeSwapPair.token0() == address(oneDreamToken));

        emit PancakeSwapPairUpdated(_newPair, token0IsOneDream);
    }

    /**
     * @notice Withdraw USDT from contract (owner only)
     */
    function withdrawUsdt(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be positive");
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance >= _amount, "Insufficient USDT balance");

        require(usdtToken.transfer(owner, _amount), "USDT transfer failed");
        emit UsdtWithdrawn(owner, _amount);
    }

    /**
     * @notice Withdraw OneDream tokens from contract (owner only) - for emergency
     */
    function withdrawOneDream(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be positive");
        uint256 balance = oneDreamToken.balanceOf(address(this));
        require(balance >= _amount, "Insufficient OneDream balance");

        require(oneDreamToken.transfer(owner, _amount), "OneDream transfer failed");
        emit OneDreamWithdrawn(owner, _amount);
    }

    // ==================== USER FUNCTIONS ====================

    /**
     * @notice Stake USDT in a package
     * @param _packageId The package to stake in
     * @param _usdtAmount Amount of USDT to stake
     * @param _referrer Address of referrer (address(0) if none)
     */
    function stake(uint256 _packageId, uint256 _usdtAmount, address _referrer) external {
        StakingPackage memory pkg = packages[_packageId];
        require(pkg.active, "Package is not active");
        require(_usdtAmount >= pkg.minAmount && _usdtAmount <= pkg.maxAmount, "Amount out of range");
        require(!hasActiveStake[msg.sender], "Already have active stake");
        require(_referrer != msg.sender, "Cannot refer yourself");

        // Transfer USDT from user to contract
        require(usdtToken.transferFrom(msg.sender, address(this), _usdtAmount), "USDT transfer failed");

        // If this is a re-stake, increment re-stake count
        uint256 restakeCount = userStakes[msg.sender].restakeCount;
        if (restakeCount > 0) {
            restakeCount++;
        }

        // Create stake
        userStakes[msg.sender] = UserStake({
            packageId: _packageId,
            usdtAmount: _usdtAmount,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            baseDurationDays: pkg.baseDurationDays,
            referralCount: 0,
            totalDurationDays: pkg.baseDurationDays,
            restakeCount: restakeCount,
            restakeBonus: 0,
            restakeBonusClaimed: false,
            referrer: _referrer
        });

        hasActiveStake[msg.sender] = true;

        // Track staker
        if (!isExistingStaker(msg.sender)) {
            allStakers.push(msg.sender);
            totalStakers++;
        }

        totalUsdtStaked += _usdtAmount;

        // Handle referral
        if (_referrer != address(0) && hasActiveStake[_referrer]) {
            UserStake storage referrerStake = userStakes[_referrer];
            StakingPackage memory referrerPkg = packages[referrerStake.packageId];

            // Add referral bonus days to referrer
            referrerStake.referralCount++;
            referrerStake.totalDurationDays += referrerPkg.referralBonusDays;

            // Track referral
            totalReferrals[_referrer]++;
            referredUsers[_referrer].push(msg.sender);

            emit ReferralAdded(_referrer, msg.sender, referrerPkg.referralBonusDays);
        }

        emit Staked(msg.sender, _packageId, _usdtAmount, _referrer);
    }

    /**
     * @notice Claim daily rewards (calculates based on current PancakeSwap price)
     */
    function claimRewards() external {
        require(hasActiveStake[msg.sender], "No active stake");

        uint256 pendingRewards = calculatePendingRewards(msg.sender);
        require(pendingRewards > 0, "No rewards to claim");

        UserStake storage userStake = userStakes[msg.sender];
        userStake.lastClaimTime = block.timestamp;

        // Transfer rewards
        require(oneDreamToken.balanceOf(address(this)) >= pendingRewards, "Insufficient OneDream in contract");
        require(oneDreamToken.transfer(msg.sender, pendingRewards), "OneDream transfer failed");

        totalRewardsPaid += pendingRewards;

        emit RewardsClaimed(msg.sender, pendingRewards);
    }

    /**
     * @notice Claim re-stake bonus (8% bonus, claimable after staking period ends)
     */
    function claimRestakeBonus() external {
        require(hasActiveStake[msg.sender], "No active stake");

        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.restakeCount > 0, "No re-stake bonus available");
        require(!userStake.restakeBonusClaimed, "Bonus already claimed");

        // Check if staking period has ended
        uint256 endTime = userStake.startTime + (userStake.totalDurationDays * 1 days);
        require(block.timestamp >= endTime, "Staking period not ended");

        // Calculate 8% bonus in OneDream tokens based on USDT staked
        uint256 oneDreamPrice = getOneDreamPrice();
        require(oneDreamPrice > 0, "Invalid price from PancakeSwap");

        // Calculate bonus: (usdtAmount * 8%) / oneDreamPrice
        // Adjust for decimals
        uint256 usdtDecimals = usdtToken.decimals();
        uint256 oneDreamDecimals = oneDreamToken.decimals();

        uint256 bonusUsdtValue = (userStake.usdtAmount * RESTAKE_BONUS_BP) / BASIS_POINTS;
        uint256 bonusOneDream = (bonusUsdtValue * (10 ** oneDreamDecimals)) / oneDreamPrice;

        userStake.restakeBonus = bonusOneDream;
        userStake.restakeBonusClaimed = true;

        // Transfer bonus
        require(oneDreamToken.balanceOf(address(this)) >= bonusOneDream, "Insufficient OneDream in contract");
        require(oneDreamToken.transfer(msg.sender, bonusOneDream), "OneDream transfer failed");

        emit RestakeBonusClaimed(msg.sender, bonusOneDream);
    }

    /**
     * @notice Complete stake and enable re-staking (only after period ends)
     * @dev This removes active stake flag, allowing user to stake again
     */
    function completeStake() external {
        require(hasActiveStake[msg.sender], "No active stake");

        UserStake storage userStake = userStakes[msg.sender];
        uint256 endTime = userStake.startTime + (userStake.totalDurationDays * 1 days);
        require(block.timestamp >= endTime, "Staking period not ended");

        // Mark as completed (allow re-stake)
        hasActiveStake[msg.sender] = false;

        // Increment re-stake count for next stake
        userStakes[msg.sender].restakeCount++;
    }

    // ==================== VIEW FUNCTIONS ====================

    /**
     * @notice Get OneDream price in USDT from PancakeSwap
     * @return Price with USDT decimals (e.g., 6 decimals for USDT)
     */
    function getOneDreamPrice() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1, ) = pancakeSwapPair.getReserves();

        if (reserve0 == 0 || reserve1 == 0) {
            return 0;
        }

        uint256 usdtDecimals = usdtToken.decimals();
        uint256 oneDreamDecimals = oneDreamToken.decimals();

        // Calculate price: USDT per OneDream
        if (token0IsOneDream) {
            // token0 = OneDream, token1 = USDT
            // Price = reserve1 / reserve0, adjusted for decimals
            return (uint256(reserve1) * (10 ** oneDreamDecimals)) / uint256(reserve0);
        } else {
            // token0 = USDT, token1 = OneDream
            // Price = reserve0 / reserve1, adjusted for decimals
            return (uint256(reserve0) * (10 ** oneDreamDecimals)) / uint256(reserve1);
        }
    }

    /**
     * @notice Calculate pending rewards for a user
     * @dev Rewards = (USDT staked * daily rate * days elapsed * OneDream price)
     */
    function calculatePendingRewards(address _user) public view returns (uint256) {
        if (!hasActiveStake[_user]) {
            return 0;
        }

        UserStake memory userStake = userStakes[_user];
        StakingPackage memory pkg = packages[userStake.packageId];

        uint256 timeElapsed = block.timestamp - userStake.lastClaimTime;
        uint256 daysElapsed = timeElapsed / 1 days;

        if (daysElapsed == 0) {
            return 0;
        }

        // Get current OneDream price
        uint256 oneDreamPrice = getOneDreamPrice();
        if (oneDreamPrice == 0) {
            return 0;
        }

        // Calculate daily reward in USDT terms
        uint256 dailyRewardUsdt = (userStake.usdtAmount * pkg.dailyRateBasisPoints) / BASIS_POINTS;
        uint256 totalRewardUsdt = dailyRewardUsdt * daysElapsed;

        // Convert USDT reward to OneDream tokens
        uint256 usdtDecimals = usdtToken.decimals();
        uint256 oneDreamDecimals = oneDreamToken.decimals();

        uint256 rewardOneDream = (totalRewardUsdt * (10 ** oneDreamDecimals)) / oneDreamPrice;

        return rewardOneDream;
    }

    /**
     * @notice Get user stake details (part 1)
     */
    function getUserStakeBasic(address _user) external view returns (
        uint256 packageId,
        uint256 usdtAmount,
        uint256 startTime,
        uint256 lastClaimTime,
        bool isActive
    ) {
        UserStake memory userStake = userStakes[_user];
        return (
            userStake.packageId,
            userStake.usdtAmount,
            userStake.startTime,
            userStake.lastClaimTime,
            hasActiveStake[_user]
        );
    }

    /**
     * @notice Get user stake details (part 2)
     */
    function getUserStakeDuration(address _user) external view returns (
        uint256 baseDurationDays,
        uint256 totalDurationDays,
        uint256 referralCount,
        uint256 restakeCount
    ) {
        UserStake memory userStake = userStakes[_user];
        return (
            userStake.baseDurationDays,
            userStake.totalDurationDays,
            userStake.referralCount,
            userStake.restakeCount
        );
    }

    /**
     * @notice Get user stake details (part 3)
     */
    function getUserStakeBonus(address _user) external view returns (
        uint256 restakeBonus,
        bool restakeBonusClaimed,
        address referrer
    ) {
        UserStake memory userStake = userStakes[_user];
        return (
            userStake.restakeBonus,
            userStake.restakeBonusClaimed,
            userStake.referrer
        );
    }

    /**
     * @notice Get package details
     */
    function getPackage(uint256 _packageId) external view returns (
        uint256 id,
        string memory name,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 dailyRateBasisPoints,
        uint256 baseDurationDays,
        uint256 referralBonusDays,
        bool active
    ) {
        StakingPackage memory pkg = packages[_packageId];
        return (
            pkg.id,
            pkg.name,
            pkg.minAmount,
            pkg.maxAmount,
            pkg.dailyRateBasisPoints,
            pkg.baseDurationDays,
            pkg.referralBonusDays,
            pkg.active
        );
    }

    /**
     * @notice Get all active packages
     */
    function getActivePackages() external view returns (StakingPackage[] memory) {
        uint256 activeCount = 0;

        // Count active packages
        for (uint256 i = 1; i < nextPackageId; i++) {
            if (packages[i].active) {
                activeCount++;
            }
        }

        // Create array
        StakingPackage[] memory activePackages = new StakingPackage[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i < nextPackageId; i++) {
            if (packages[i].active) {
                activePackages[index] = packages[i];
                index++;
            }
        }

        return activePackages;
    }

    /**
     * @notice Get referral stats for a user
     */
    function getReferralStats(address _user) external view returns (
        uint256 totalReferralCount,
        address[] memory referredUsersList
    ) {
        return (
            totalReferrals[_user],
            referredUsers[_user]
        );
    }

    /**
     * @notice Check if user can re-stake
     */
    function canRestake(address _user) external view returns (bool) {
        if (hasActiveStake[_user]) {
            UserStake memory userStake = userStakes[_user];
            uint256 endTime = userStake.startTime + (userStake.totalDurationDays * 1 days);
            return block.timestamp >= endTime;
        }
        return !hasActiveStake[_user];
    }

    /**
     * @notice Get time remaining until stake period ends
     */
    function getTimeRemaining(address _user) external view returns (uint256) {
        if (!hasActiveStake[_user]) {
            return 0;
        }

        UserStake memory userStake = userStakes[_user];
        uint256 endTime = userStake.startTime + (userStake.totalDurationDays * 1 days);

        if (block.timestamp >= endTime) {
            return 0;
        }

        return endTime - block.timestamp;
    }

    /**
     * @notice Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 _totalUsdtStaked,
        uint256 _totalStakers,
        uint256 _totalRewardsPaid,
        uint256 usdtBalance,
        uint256 oneDreamBalance,
        uint256 currentOneDreamPrice
    ) {
        return (
            totalUsdtStaked,
            totalStakers,
            totalRewardsPaid,
            usdtToken.balanceOf(address(this)),
            oneDreamToken.balanceOf(address(this)),
            getOneDreamPrice()
        );
    }

    /**
     * @notice Check if address is existing staker
     */
    function isExistingStaker(address _user) internal view returns (bool) {
        for (uint256 i = 0; i < allStakers.length; i++) {
            if (allStakers[i] == _user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get all stakers
     */
    function getAllStakers() external view returns (address[] memory) {
        return allStakers;
    }

    /**
     * @notice Get total package count
     */
    function getPackageCount() external view returns (uint256) {
        return nextPackageId - 1;
    }
}
