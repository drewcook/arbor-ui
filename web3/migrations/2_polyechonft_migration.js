const PolyEchoNFTContract = artifacts.require('PolyEchoNFT')

module.exports = function (deployer) {
	deployer.deploy(PolyEchoNFTContract)
}
