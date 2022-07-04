import detectEthereumProvider from '@metamask/detect-provider'
import { providers } from 'ethers'
import Web3 from 'web3'
import { NETWORK_RPC } from '../constants/networks'

const getWeb3 = async () => {
	const provider = await detectEthereumProvider()

	// Modern dapp browsers...
	if (provider) {
		// provider === window.ethereum
		// const web3 = new Web3(provider)
		try {
			// Request account access if needed
			await provider.request({ method: 'eth_requestAccounts' })
			// Accounts now exposed
			const ethersProvider = new providers.StaticJsonRpcProvider(NETWORK_RPC)
			const signer = ethersProvider.getSigner()
			// const signerAddress = await signer.getAddress()
			return { provider, signer }
		} catch (error) {
			console.error('Please install a Web3 wallet.', error)
			return false
		}
	}
	// Legacy dapp browsers...
	else if (window.web3) {
		// Use Mist/MetaMask's provider.
		const web3 = window.web3
		console.info('Injected web3 detected.')
		return web3
	}
	// Fallback to localhost use dev console port by default...
	else {
		const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
		const web3 = new Web3(provider)
		console.info('No web3 instance injected, using Local web3.')
		return web3
	}
}

export default getWeb3
