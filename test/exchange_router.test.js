const Energy = artifacts.require("Energy");
const Sand = artifacts.require("Sand");
const InfiniteExchange = artifacts.require("InfiniteExchange");
const ExchangeRouter = artifacts.require("ExchangeRouter");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract("ExchangeRouter", function (accounts) {
    it("should assert true", async function () {
        const energy = await Energy.new();
        const sand = await Sand.new();
        const energyExchange = await InfiniteExchange.new(energy.address);
        const sandExchange = await InfiniteExchange.new(sand.address);
        const exchangeRouter = await ExchangeRouter.new();

        expectEvent(await exchangeRouter.addExchange(energyExchange.address), "ExchangeRegistered", { exchange: energyExchange.address, resource: energy.address });
        await expectRevert(exchangeRouter.addExchange(energyExchange.address), "Exchange for resource already registered");
        await expectRevert(exchangeRouter.addExchange(ZERO_ADDRESS), "Invalid exchange");
        expectEvent(await exchangeRouter.addExchange(sandExchange.address), "ExchangeRegistered", { exchange: sandExchange.address, resource: sand.address });
        
        const sandEx = await exchangeRouter.getExchange(sand.address);
        assert(sandEx == sandExchange.address);
        await expectRevert(exchangeRouter.getExchange(ZERO_ADDRESS), "Invalid resource");
        await expectRevert(exchangeRouter.getExchange(sandExchange.address), "No exchange registered for resource");
    });
});