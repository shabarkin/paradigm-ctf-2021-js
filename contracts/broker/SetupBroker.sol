pragma solidity 0.8.0;

import "./Broker.sol";

contract Token {
    mapping(address => uint256) public balanceOf;
    mapping(address => bool) public dropped;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply = 1_000_000 ether;
    uint256 public AMT = totalSupply / 100_000;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function approve(address to, uint256 amount) public returns (bool) {
        allowance[msg.sender][to] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        return transferFrom(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        if (from != msg.sender) {
            allowance[from][to] -= amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function airdrop() public {
        require(!dropped[msg.sender], "err: only once");
        dropped[msg.sender] = true;
        balanceOf[msg.sender] += AMT;
        totalSupply += AMT;
    }
}

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}


contract SetupBroker {
    iWETH9 public weth;
    IUniswapV2Factory public factory;
    Token public token;
    IUniswapV2Pair public pair;
    Broker public broker;

    uint256 constant DECIMALS = 1 ether;
    uint256 public totalBefore;

    // create and bootstrap the token/weth pool for borrowing against WETH
    constructor(address _weth, address _factory) payable {

        weth = iWETH9(_weth);
        factory = IUniswapV2Factory(_factory);

        require(msg.value == 50 ether, "NOT ENOUGHT INITIAL MONEY");
        weth.deposit{value: msg.value}();

        token = new Token();
        pair = IUniswapV2Pair(factory.createPair(address(weth), address(token)));
        broker = new Broker(pair, ERC20Like(address(token)), weth);
        token.transfer(address(broker), 500_000 * DECIMALS);

        // // // 1:25
        weth.transfer(address(pair), 25 ether);
        token.transfer(address(pair), 500_000 * DECIMALS);
        pair.mint(address(this));

        weth.approve(address(broker), type(uint256).max);
        broker.deposit(25 ether);
        broker.borrow(250_000 * DECIMALS);

        totalBefore = weth.balanceOf(address(broker)) + token.balanceOf(address(broker)) / broker.rate();
    }

    function isSolved() public view returns (bool) {
        return weth.balanceOf(address(broker)) < 5 ether;
    }
}