pragma solidity 0.8.0;

import "./Bouncer.sol";

interface iWETH9 is ERC20Like {
    function deposit() external payable;
}

contract SetupBouncer {
    address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    iWETH9 public weth;
    Bouncer public bouncer;
    Party public party;

    constructor(address _weth) payable {
        require(msg.value == 100 ether);

        weth = iWETH9(_weth);
        // give some cash to the bouncer for his drinks
        bouncer = new Bouncer{value: 50 ether}();

        // 2 * eth
        bouncer.enter{value: 1 ether}(address(weth), 10 ether);
        bouncer.enter{value: 1 ether}(ETH, 10 ether);

        party = new Party(bouncer);
    }

    function isSolved() public view returns (bool) {
        return address(bouncer).balance == 0;
    }
}
