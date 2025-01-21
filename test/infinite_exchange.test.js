const EnergyToken = artifacts.require("EnergyToken");
const InfiniteExchange = artifacts.require("InfiniteExchange");
const { BN, expectRevert, expectEvent, ether } = require('@openzeppelin/test-helpers');
const { toWei: web3ToWei } = require('web3-utils');

function toWei(n, unit) {
    return new BN(web3ToWei(n, unit));
}

contract("InfiniteExchange", function (accounts) {
    it("should assert true", async function () {
        const energyToken = await EnergyToken.deployed();
        const infiniteExchange = await InfiniteExchange.deployed();
        const resource = await infiniteExchange.getResource();
        assert.equal(energyToken.address, resource);

        const tokenOwner = accounts[0];
        const buyer = accounts[1];
        const seller = accounts[2];

        await energyToken.addMinter(infiniteExchange.address);
        await energyToken.addMinter(tokenOwner);

        let pricePerSol = await infiniteExchange.pricePerSol();
        assert(pricePerSol.eq(new BN(100)));
        let balance = await energyToken.totalSupply();
        assert(balance.eq(new BN(0)));
        const preBalance = new BN(await web3.eth.getBalance(buyer));
        expectEvent(await infiniteExchange.buy({ from: buyer, value: ether("1") }), "Trade", { "sender": buyer, "resource": energyToken.address, "selling": false, "amountSol": ether("1").sub(toWei("1", "gwei")), "amountResource": new BN(9900) });;
        const postBalance = new BN(await web3.eth.getBalance(buyer));
        assert(preBalance.sub(postBalance).gte(ether("1")));
        balance = new BN(await web3.eth.getBalance(infiniteExchange.address));
        assert(balance.eq(ether("1")));
        balance = await energyToken.balanceOf(buyer);
        assert(balance.eq(new BN(9900)));
        balance = await energyToken.totalSupply();
        assert(balance.eq(new BN(9900)));
        pricePerSol = await infiniteExchange.pricePerSol();
        assert(pricePerSol.eq(new BN(10)));

        await energyToken.mint(100, { from: tokenOwner });
        await energyToken.transfer(seller, 100);
        balance = await energyToken.balanceOf(seller);
        assert(balance.eq(new BN(100)));

        pricePerSol = await infiniteExchange.pricePerSol();
        assert(pricePerSol.eq(new BN(10)));
        await expectRevert.unspecified(infiniteExchange.sell(100, { from: seller }));
        await energyToken.approve(infiniteExchange.address, 100, { from: seller });
        expectEvent(await infiniteExchange.sell(100, { from: seller }), "Trade", { "sender": seller, "resource": energyToken.address, "selling": true, "amountSol": ether("0.1").sub(toWei("1", "gwei")), "amountResource": new BN(100) });
        balance = await energyToken.balanceOf(seller);
        assert(balance.eq(new BN(0)));
        balance = await energyToken.balanceOf(infiniteExchange.address);
        assert(balance.eq(new BN(0)));
        pricePerSol = await infiniteExchange.pricePerSol();
        assert(pricePerSol.eq(new BN(11)));

        let accruedFees = await infiniteExchange.accruedFees();
        assert(accruedFees.eq(toWei("2", "gwei")));
        balance = await web3.eth.getBalance(infiniteExchange.address);
        assert(new BN(balance).eq(toWei("1", "ether").sub(toWei("0.1", "ether").sub(toWei("1", "gwei")))));
        await infiniteExchange.withdraw();
        balance = await web3.eth.getBalance(infiniteExchange.address);
        assert(new BN(balance).eq(toWei("1", "ether").sub(toWei("0.1", "ether").add(toWei("1", "gwei")).sub(toWei("2", "gwei")))));
        accruedFees = await infiniteExchange.accruedFees();
        assert(accruedFees.eq(new BN(0)));
        /*
            await energyToken.transfer(exchangePool.address, 1000, { from: tokenOwner });
            balance = await energyToken.balanceOf(tokenOwner);
            assert(balance.eq(new BN(0)));
            balance = await energyToken.balanceOf(exchangePool.address);
            assert(balance.eq(new BN(1000)));
            await web3.eth.getBalance(tokenOwner);
            await web3.eth.sendTransaction({ from: tokenOwner, to: exchangePool.address, value: ether("10") });
            balance = await web3.eth.getBalance(exchangePool.address);
            assert(new BN(balance).eq(ether("10")));
            balance = await energyToken.balanceOf(exchangePool.address);
            assert(balance.eq(new BN(1000)));
        
            await energyToken.mint(1000, { from: tokenOwner });
            await energyToken.transfer(seller, 1000, { from: tokenOwner });
            balance = await energyToken.balanceOf(seller);
            assert(balance.eq(new BN(1000)));
        
            let pricePerSol = await exchangePool.pricePerSol();
            assert(pricePerSol.eq(new BN(100)));
            await expectRevert.unspecified(exchangePool.sell(100, { from: seller }));
            await energyToken.approve(exchangePool.address, 1000, { from: seller });
            expectEvent(await exchangePool.sell(100, { from: seller }), "Trade", { "sender": seller, "resource": energyToken.address, "sale": true, "amountSol": ether("1").sub(toWeiBN("1", "gwei")), "amountResource": new BN(100) });
            balance = await energyToken.balanceOf(seller);
            assert(balance.eq(new BN(900)));
            balance = await energyToken.balanceOf(exchangePool.address);
            assert(balance.eq(new BN(1100)));
            pricePerSol = await exchangePool.pricePerSol();
            assert(pricePerSol.eq(new BN(190)));
            let collectableFees = await exchangePool.collectableFees();
            assert(collectableFees.eq(toWei("1", "gwei")));
            balance = await web3.eth.getBalance(exchangePool.address);
            assert(new BN(balance).eq(ether("9").add(toWei("1", "gwei"))));
        
            try {
              await web3.eth.sendTransaction({ from: buyer, to: exchangePool.address, value: new BN(1) });
              assert(false);
            } catch (error) {}
        
            await web3.eth.sendTransaction({ from: buyer, to: exchangePool.address, value: ether("1").add(toWei("1", "gwei")) });
        
            balance = await energyToken.balanceOf(buyer);
            assert(balance.eq(new BN(190)));
            balance = await energyToken.balanceOf(exchangePool.address);
            assert(balance.eq(new BN(910)));
            pricePerSol = await exchangePool.pricePerSol();
            assert(pricePerSol.eq(new BN(10)));
            collectableFees = await exchangePool.collectableFees();
            assert(collectableFees.eq(toWei("2", "gwei")));
        
            balance = await web3.eth.getBalance(exchangePool.address);
            assert(new BN(balance).eq(ether("10").add(toWeiBN("2", "gwei"))));
        
            balance = await exchangePool.collectableFees();
            assert(new BN(balance).eq(toWei("2", "gwei")));
            await exchangePool.withdraw({ from: tokenOwner });
            balance = await exchangePool.collectableFees();
            assert(new BN(balance).eq(new BN(0)));
            balance = await web3.eth.getBalance(exchangePool.address);
            assert(new BN(balance).eq(ether("10")));
        
            balance = await energyToken.totalSupply();
            assert(balance.eq(new BN(2000)));*/
    });
});