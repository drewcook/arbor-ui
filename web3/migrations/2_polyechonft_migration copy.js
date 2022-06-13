const StemQueueContract = artifacts.require('StemQueue')

module.exports = function (deployer) {
	deployer.deploy(StemQueueContract)
}
