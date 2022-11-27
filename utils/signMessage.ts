import _wallet from '../_dev/_wallet'

const signMessage = async (msg: string): Promise<string> => {
	// const ethereumProvider = (await detectEthereumProvider()) as any
	// const provider = new providers.Web3Provider(ethereumProvider)
	// const signer = provider.getSigner()
	// const message = await signer.signMessage(msg)

	const message = await _wallet.signer.signMessage(msg)
	return message
}

export default signMessage
