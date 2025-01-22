// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IToken, IHarvester} from "./Interfaces.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

struct Ingredient {
    address ingredient;
    uint256 amount;
}

contract Crafter is Ownable {
    event Recipe(address indexed target, Ingredient[] indexed ingredients);

    uint256 constant public FEE = 1 gwei;
    mapping(address => Ingredient[]) private recipes;
    mapping(address => bool) private registeredRecipes;

    constructor() Ownable(msg.sender) {}

    function addRecipe(address target, Ingredient[] memory ingredients) external onlyOwner() {
        require(!registeredRecipes[target], "Target already registered");
        require(ingredients.length > 0, "At least one ingredient required");
        for (uint256 index; index < ingredients.length; index++) {
            address ingredient = ingredients[index].ingredient;
            uint256 amount = ingredients[index].amount;
            require(ingredient != address(0) && amount > 0, "Requires nonzero ingredient");
            recipes[target].push(ingredients[index]);
        }
        registeredRecipes[target] = true;
        emit Recipe(target, ingredients);
    }

    function craft(address target) external payable returns (uint256) {
        require(msg.value == FEE, "Transaction has a fee of 1 gwei");
        require(registeredRecipes[target], "Target not registered");
        Ingredient[] memory ingredients = recipes[target];
        for (uint256 index; index < ingredients.length; index++) {
            Ingredient memory ingredient = ingredients[index];
            IToken ingredientToken = IToken(ingredient.ingredient);
            require(ingredientToken.transferFrom(msg.sender, address(this), ingredient.amount), "Transfer failed");
            ingredientToken.burn(ingredient.amount);
        }
        IHarvester harvester = IHarvester(target);
        uint256 tokenId = harvester.mint();
        harvester.safeTransferFrom(address(this), msg.sender, tokenId);
        return tokenId;
    }

    function withdraw() external onlyOwner {
        require(payable(msg.sender).send(address(this).balance), "Failed to send Ether");
    }
}