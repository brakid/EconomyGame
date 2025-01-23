const Energy = artifacts.require("Energy");
const Sand = artifacts.require("Sand");
const ResourceRouter = artifacts.require("ResourceRouter");
const { expectRevert } = require('@openzeppelin/test-helpers');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract("ResourceRouter", function (accounts) {
    it("should assert true", async function () {
        const energy = await Energy.new();
        const sand = await Sand.new();
        const resourceRouter = await ResourceRouter.new();

        await resourceRouter.addResource("Energy", energy.address);
        let resources = await resourceRouter.getResources();
        console.log(resources[0]);
        assert(resources.length == 1 && resources[0] == "Energy");
        await resourceRouter.addResource("Sand", sand.address);
        resources = await resourceRouter.getResources();
        assert(resources.length == 2 && resources[0] == "Energy" && resources[1] == "Sand");
        await expectRevert(resourceRouter.addResource("Dummy", ZERO_ADDRESS), "Invalid resource");
        await expectRevert(resourceRouter.addResource("", sand.address), "Empty resource name");
        await expectRevert(resourceRouter.addResource("Sand", energy.address), "Resource with name already registered");
        const resource = await resourceRouter.getResource("Sand");
        assert(resource == sand.address);
    });
});