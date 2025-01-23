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
    event Recipe(address indexed target, Ingredient[] indexed ingredients, bool indexed isCraftingRecipe);

    uint256 constant public FEE = 1 gwei;
    mapping(address => Ingredient[]) private craftingRecipes;
    mapping(address => Ingredient[]) private refinementRecipes;
    mapping(address => bool) private registeredCraftingRecipes;
    mapping(address => bool) private registeredRefinementRecipes;

    constructor() Ownable(msg.sender) {}

    function addCraftingRecipe(address target, Ingredient[] memory ingredients) external onlyOwner() {
        require(!registeredCraftingRecipes[target], "Target already registered");
        require(ingredients.length > 0, "At least one ingredient required");
        for (uint256 index; index < ingredients.length; index++) {
            address ingredient = ingredients[index].ingredient;
            uint256 amount = ingredients[index].amount;
            require(ingredient != address(0) && amount > 0, "Requires nonzero ingredient");
            craftingRecipes[target].push(ingredients[index]);
        }
        registeredCraftingRecipes[target] = true;
        emit Recipe(target, ingredients, true);
    }

    function addRefinementRecipe(address target, Ingredient[] memory ingredients) external onlyOwner() {
        require(!registeredRefinementRecipes[target], "Target already registered");
        require(ingredients.length > 0, "At least one ingredient required");
        for (uint256 index; index < ingredients.length; index++) {
            address ingredient = ingredients[index].ingredient;
            uint256 amount = ingredients[index].amount;
            require(ingredient != address(0) && amount > 0, "Requires nonzero ingredient");
            refinementRecipes[target].push(ingredients[index]);
        }
        registeredRefinementRecipes[target] = true;
        emit Recipe(target, ingredients, false);
    }

    function refine(address target) external payable returns (uint256) {
        require(msg.value == FEE, "Transaction has a fee of 1 gwei");
        require(registeredRefinementRecipes[target], "Target not registered");
        Ingredient[] memory ingredients = refinementRecipes[target];
        for (uint256 index; index < ingredients.length; index++) {
            Ingredient memory ingredient = ingredients[index];
            IToken ingredientToken = IToken(ingredient.ingredient);
            require(ingredientToken.transferFrom(msg.sender, address(this), ingredient.amount), "Transfer failed");
            ingredientToken.burn(ingredient.amount);
        }
        IToken token = IToken(target);
        uint256 amount = (10**token.decimals());
        token.mint(amount);
        require(token.transfer(msg.sender, amount), "Transfer failed");
        return amount;
    }

    function craft(address target) external payable returns (uint256) {
        require(msg.value == FEE, "Transaction has a fee of 1 gwei");
        require(registeredCraftingRecipes[target], "Target not registered");
        Ingredient[] memory ingredients = craftingRecipes[target];
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
        require(payable(msg.sender).send(address(this).balance), "Transfer failed");
    }
}