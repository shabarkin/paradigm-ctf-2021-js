pragma solidity 0.4.16;

import "./SingleOwnerGuard.sol";
import "./GuardRegistry.sol";
import "./Vault.sol";

contract SetupVault {
    GuardRegistry public registry;
    Vault public vault;
    
    function SetupVault() public {
        registry = new GuardRegistry();
        registry.registerGuardImplementation(new SingleOwnerGuard(), true);
        
        vault = new Vault(registry);
        
        SingleOwnerGuard guard = SingleOwnerGuard(vault.guard());
        guard.addPublicOperation("deposit");
        guard.addPublicOperation("withdraw");
    }
    
    function isSolved() public view returns (bool) {
        return vault.owner() != address(this);
    }
}