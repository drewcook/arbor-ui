// import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3'
import getWalletConnectProvider from './getWalletConnectProvider'

const getWeb3 = async () => {
	// const provider = await detectEthereumProvider()
	//  Enable session (triggers QR Code modal)
	const provider = await getWalletConnectProvider()
	const res = await provider.enable()

	// Subscribe to accounts change
	provider.on('accountsChanged', (accounts: string[]) => {
		console.log('Changing accounts', accounts)
	})

	// Subscribe to chainId change
	provider.on('chainChanged', (chainId: number) => {
		console.log('Changing chains', chainId)
	})

	// Subscribe to session disconnection
	provider.on('disconnect', (code: number, reason: string) => {
		console.log('Disconnecting', code, reason)
	})

	const disconnect = await provider.disconnect()

	console.log({ res })

	// Modern dapp browsers...
	if (res) {
		try {
			// provider === window.ethereum
			// @ts-ignore
			const web3 = new Web3(provider)
			console.log({ web3 })
			// Request account access if needed
			// await provider.request({ method: 'eth_requestAccounts' })
			// Accounts now exposed
			return web3
		} catch (error) {
			console.error('Please install a Web3 wallet.', error)
			return false
		}
	}
	// Legacy dapp browsers...
	// @ts-ignore
	else if (window.web3) {
		// Use Mist/MetaMask's provider.
		// @ts-ignore
		const web3 = window.web3
		console.log('Injected web3 detected.')
		return web3
	}
	// Fallback to localhost use dev console port by default...
	else {
		const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
		const web3 = new Web3(provider)
		console.log('No web3 instance injected, using Local web3.')
		return web3
	}
}

export default getWeb3
