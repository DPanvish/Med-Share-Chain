// Get the contract "artifact"
// This is a JSON file created when you compile,
// which contains the contract's ABI and bytecode.
const AccessControl = artifacts.require("AccessControl");

module.exports = function (deployer) {
    // The 'deployer' object is Truffle's main tool for handling deployments.
    // The .deploy() function takes the contract artifact as its first argument.
    // Any additional arguments are passed to the contract's constructor.
    // Since our contract doesn't have a constructor, we just pass the artifact.
    deployer.deploy(AccessControl);
};