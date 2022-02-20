const PolyechoNFTContract = artifacts.require('PolyechoSample')

module.exports = function (deployer) {
	deployer.deploy(PolyechoNFTContract)
}
