const SampleNFTContract = artifacts.require('Sample')

module.exports = function (deployer) {
	deployer.deploy(SampleNFTContract)
}
