var Localbody = artifacts.require("./contracts/Localbody.sol");
var Voter = artifacts.require("./contracts/Voter.sol");
var localbodyInstance;

module.exports = function(deployer, network, accounts) {
    deployer.deploy(Localbody, 1000000)
        .then( () => Localbody.deployed())
        .then(instance => {
            localbodyInstance = instance;
            return localbodyInstance.addEther({ value: web3.toWei(10, "ether") });
        }).then( () => {
            console.log("Deployed Localbody.");
            (function loop(i) {
                localbodyInstance.createVoter("secret", { from: accounts[i] })
                    .then( tx => {
                        return localbodyInstance.approveVoter(tx.logs[1].args.voterAddress);
                    }).then( () => {
                        console.log("Created voter " + i + " .");
                        if(i < 8) {
                            loop(i + 1);
                        }
                    })
            })(1);
         });
}
