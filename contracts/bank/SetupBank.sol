pragma solidity 0.4.24;

import "./Bank.sol";

contract iWETH9 is ERC20Like {
    function deposit() public payable;
}

contract SetupBank {
    iWETH9 public weth;
    Bank public bank;
    
    constructor(address _weth) public payable {
        require(msg.value == 55 ether);

        weth = iWETH9(_weth);
        
        bank = new Bank();
        
        weth.deposit.value(50 ether)();
        weth.approve(address(bank), uint(-1));
        bank.depositToken(0, address(weth), weth.balanceOf(address(this)));
    }
    
    function isSolved() external view returns (bool) {
        return weth.balanceOf(address(bank)) == 0;
    }
}
