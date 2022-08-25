pragma solidity 0.7.0;

import "./BabySandbox.sol";

contract SetupBabySandbox {
    BabySandbox public sandbox;
    
    constructor() {
        sandbox = new BabySandbox();
    }
    
    function isSolved() public view returns (bool) {
        uint size;
        assembly {
            size := extcodesize(sload(sandbox.slot))
        }
        return size == 0;
    }
}
