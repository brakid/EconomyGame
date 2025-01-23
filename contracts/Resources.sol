// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ResourceToken, IToken} from "./Interfaces.sol";

contract Energy is ResourceToken {
    constructor() ResourceToken("Energy", "NRG", 2) {}
}

contract Sand is ResourceToken {
    constructor() ResourceToken("Sand", "SND", 0) {}
}

contract IronOre is ResourceToken {
    constructor() ResourceToken("IronOre", "IRE", 0) {}
}

contract Oil is ResourceToken {
    constructor() ResourceToken("Oil", "OIL", 0) {}
}

contract Silicium is ResourceToken {
    constructor() ResourceToken("Silicium", "SI", 0) {}
}

contract Iron is ResourceToken {
    constructor() ResourceToken("Iron", "FE", 0) {}
}

contract Carbon is ResourceToken {
    constructor() ResourceToken("Carbon", "C", 0) {}
}

contract ResourceRouter is Ownable {
    mapping(string => address) private registeredResources;
    string[] private resourceNames;

    constructor() Ownable(msg.sender) {}

    function addResource(string memory _name, address _resource) external onlyOwner {
        require(_resource != address(0), "Invalid resource");
        require(bytes(_name).length > 0, "Empty resource name");
        require(registeredResources[_name] == address(0), "Resource with name already registered");
        registeredResources[_name] = _resource;
        resourceNames.push(_name);
    }

    function getResource(string memory _name) external view returns (IToken) {
        address resource = registeredResources[_name];
        require(resource != address(0), "No resource registered with name");
        return IToken(resource);
    }

    function getResources() external view returns (string[] memory) {
        return resourceNames;
    }
}