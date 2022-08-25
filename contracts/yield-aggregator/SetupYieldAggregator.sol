pragma solidity 0.8.0;

import "./YieldAggregator.sol";

// dumb bank with 0% interest rates
contract MiniBank is Protocol {
    ERC20Like public override underlying;

    constructor(address _underlying) {
        underlying = ERC20Like(_underlying);
    }

    mapping (address => uint256) public balanceOf;
    uint256 public totalSupply;

    function mint(uint256 amount) public override {
        require(underlying.transferFrom(msg.sender, address(this), amount));
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
    }

    function burn(uint256 amount) public override {
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        require(underlying.transfer(msg.sender, amount));
    }

    function balanceUnderlying() public override view returns (uint256) {
        return underlying.balanceOf(address(this));
    }

    function rate() public override view returns (uint256) {
        return 1;
    }
}

interface iWETH9 is ERC20Like {
    function deposit() external payable;
    function withdraw(uint wad) external;
}

contract SetupYieldAggregator {
    YieldAggregator public aggregator;
    MiniBank public bank;
    iWETH9 public weth;

    constructor(address _weth) payable {

        require(msg.value == 55 ether);

        // configure the weth contract
        weth = iWETH9(_weth);

        // deploy minibank
        bank = new MiniBank(_weth);

        // deploy yield aggregator
        aggregator = new YieldAggregator();

        // change ETH for wETH 
        weth.deposit{value: msg.value}();

        // allow aggregator spent any amount of money 
        weth.approve(address(aggregator), type(uint256).max);

        address[] memory _tokens = new address[](1);
        _tokens[0] = address(weth);

        uint256[] memory _amounts = new uint256[](1);
        _amounts[0] = 50 ether;

        // we deposit 50 weth to the system
        aggregator.deposit(Protocol(address(bank)), _tokens, _amounts);
    }

    function isSolved() public view returns (bool) {
        return weth.balanceOf(address(aggregator)) == 0 && weth.balanceOf(address(bank)) == 0;
    }
}
