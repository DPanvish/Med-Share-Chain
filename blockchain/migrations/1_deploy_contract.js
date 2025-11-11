// This line "imports" the contract artifact, which is the JSON file
// Truffle created in the 'build/contracts/' folder.
const AccessControl = artifacts.require("AccessControl");

// All migrations must export a function
module.exports = function (deployer) {
    // The 'deployer' object is your main tool for deploying.
    // The deploy() function takes the contract (that we imported above)
    // as its first argument.
    //
    // If your contract's constructor needed arguments (e.g., an admin address),
    // you would pass them here, like: deployer.deploy(AccessControl, adminAddress);
    //
    // Ours is simple, so we just pass the contract itself.
    deployer.deploy(AccessControl);
};