const PolyechoNFTContract = artifacts.require('PolyechoNFT')

module.exports = function (deployer) {
	deployer.deploy(PolyechoNFTContract)
}
