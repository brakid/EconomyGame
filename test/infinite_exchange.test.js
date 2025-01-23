const Energy = artifacts.require("Energy");
const InfiniteExchange = artifacts.require("InfiniteExchange");
const { BN, expectRevert, expectEvent, ether } = require('@openzeppelin/test-helpers');
const { toWei: web3ToWei } = require('web3-utils');

function toWei(n, unit) {
    return new BN(web3ToWei(n, unit));
}

contract("InfiniteExchange", function (accounts) {
    it("should assert true", async function () {
        const energy = await Energy.new();
        const infiniteExchange = await InfiniteExchange.new(energy.address);
        const resource = await infiniteExchange.getResource();
        assert.equal(energy.address, resource);

        const tokenOwner = accounts[0];
        const buyer = accounts[1];
        const seller = accounts[2];

        await energy.addMinter(infiniteExchange.address);
        await energy.addMinter(tokenOwner);

        let pricePerSol = await infiniteExchange.pricePerSol();
        assert(pricePerSol.eq(new BN(100)));
        let balance = await energy.totalSupply();
        assert(balance.eq(new BN(0)));
        const preBalance = new BN(await web3.eth.getBalance(buyer));
        expectEvent(await infiniteExchange.buy({ from: buyer, value: ether("1") }), "Trade", { "sender": buyer, "resource": energy.address, "selling": false, "amountSol": ether("1").sub(toWei("1", "gwei")), "amountResource": new BN(9900) });;
        const postBalance = new BN(await web3.eth.getBalance(buyer));
        assert(preBalance.sub(postBalance).gte(ether("1")));
        balance = new BN(await web3.eth.getBalance(infiniteExchange.address));
        assert(balance.eq(ether("1")));
        balance = await energy.balanceOf(buyer);
        assert(balance.eq(new BN(9900)));
        balance = await energy.totalSupply();
        assert(balance.eq(new BN(9900)));
        pricePerSol = await infiniteExchange.pricePerSol();
        assert(pricePerSol.eq(new BN(10)));

        await energy.mint(100, { from: tokenOwner });
        await energy.transfer(seller, 100);
        balance = await energy.balanceOf(seller);
        assert(balance.eq(new BN(100)));

        pricePerSol = await infiniteExchange.pricePerSol();
        assert(pricePerSol.eq(new BN(10)));
        await expectRevert.unspecified(infiniteExchange.sell(100, { from: seller }));
        await energy.approve(infiniteExchange.address, 100, { from: seller });
        expectEvent(await infiniteExchange.sell(100, { from: seller }), "Trade", { "sender": seller, "resource": energy.address, "selling": true, "amountSol": ether("0.1").sub(toWei("1", "gwei")), "amountResource": new BN(100) });
        balance = await energy.balanceOf(seller);
        assert(balance.eq(new BN(0)));
        balance = await energy.balanceOf(infiniteExchange.address);
        assert(balance.eq(new BN(0)));
        pricePerSol = await infiniteExchange.pricePerSol();
        assert(pricePerSol.eq(new BN(11)));

        let accruedFees = await infiniteExchange.accruedFees();
        assert(accruedFees.eq(toWei("2", "gwei")));
        balance = await web3.eth.getBalance(infiniteExchange.address);
        const expectedBalance = toWei("1", "ether").sub(toWei("0.1", "ether").sub(toWei("1", "gwei"))); // 1 ether paid in (including 1 gwei in fees), 0.1 ether - 1 gwei (fees) paid out 
        assert(new BN(balance).eq(expectedBalance));
        await infiniteExchange.withdraw();
        balance = await web3.eth.getBalance(infiniteExchange.address);
        assert(new BN(balance).eq(expectedBalance.sub(toWei("2", "gwei"))));
        accruedFees = await infiniteExchange.accruedFees();
        assert(accruedFees.eq(new BN(0)));
    });
});