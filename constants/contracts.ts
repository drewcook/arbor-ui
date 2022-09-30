import { Contract, providers } from 'ethers'
import ArborAudioCollections from '../contracts/ArborAudioCollections.json'
import StemQueue from '../contracts/StemQueue.json'
import { NETWORK_NAME, NETWORK_RPC } from './networks'

/******************************************************************************
	NOTE: Update these values after each new deployment to the relative network
*******************************************************************************/

const contracts = {
	// Last deployed: 07/03/22
	Localhost: {
		nft: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
		verifier: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
		poseidonT3: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
		incrementalBinaryTree: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
		stemQueue: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
	},
	// Last deployed: 09/30/22
	'Polygon Mainnet': {
		nft: '0xf6c55e9fAeeaa214f4B23c92e0C88953D19e3dD0',
		verifier: '0x410c16A302d7672a9bEEBE6aF0E4c37122244E13',
		poseidonT3: '0x5616971539C1d6aCb632A997436f66eA35f66CBC',
		incrementalBinaryTree: '0x55D5452Ba831D0aa0Dd0fc8D304D3bcAE8220385',
		stemQueue: '0x222bF026aCd1Aece8DB92172F161D63AaC369Bba',
	},
	// Last deployed: 07/04/22
	'Polygon Testnet': {
		nft: '0xC766c9697daA11BA610355D3F4Bf8483126B9331',
		verifier: '0xe8D0D5F3D6099Bc075459591CDA8a453336162Dd',
		poseidonT3: '0x5270a07403F1f3D85A860f20C255deFD424dA9E0',
		incrementalBinaryTree: '0x653916193B0902452bF6cC84343DDF37178fc4E0',
		stemQueue: '0xeb2369a0076A836F18f32daB91Fe3400Edf003AE',
	},
	// Last deployed: 09/30/22
	'Harmony Mainnet': {
		nft: '0x5663E41c235025fA3AE8B02d8a5082FB985eB791',
		verifier: '0xAb3a31d86819Bbd3C56DaBCBB926fe6e60824C23',
		poseidonT3: '0x4141563575DE5c8bD8159F14bF7e5037D38D00C2',
		incrementalBinaryTree: '0xbf805FDc12BD94c087Fa1c82DbBe12707aaCdB24',
		stemQueue: '0x6F6f53296049149a02373E3458fb105171481268',
	},
	// Last deployed: 09/30/22
	'Harmony Testnet': {
		nft: '0x5663E41c235025fA3AE8B02d8a5082FB985eB791',
		verifier: '0xAb3a31d86819Bbd3C56DaBCBB926fe6e60824C23',
		poseidonT3: '0x4141563575DE5c8bD8159F14bF7e5037D38D00C2',
		incrementalBinaryTree: '0xbf805FDc12BD94c087Fa1c82DbBe12707aaCdB24',
		stemQueue: '0x6F6f53296049149a02373E3458fb105171481268',
	},
	// Last deployed: 09/30/22
	'Harmony Devnet': {
		nft: '0xa9ADDccB22754f8669f7BB62A7ec80389503F451',
		verifier: '0x7Bc6230885C4e67Be337FddBAFE2911645403193',
		poseidonT3: '0x2d7155C690f6b80c9A14E0e2313a185420C6dEC4',
		incrementalBinaryTree: '0x0bb8e90DA630d962Eb456173892EA56e6687e222',
		stemQueue: '0xAEca10e3d2DB048Db77d8C3f86A9b013b0741Ba2',
	},
}

// Create our Provider instance
export const provider = new providers.JsonRpcProvider(NETWORK_RPC)

// NOTE: We could add in instances of the other three contracts, but currently there is no direct usage of them.

// ArborAudioCollections contract
export const NFT_CONTRACT_ADDRESS = contracts[NETWORK_NAME].nft
export const collectionsContract = new Contract(NFT_CONTRACT_ADDRESS, ArborAudioCollections.abi)

// StemQueue contract
export const STEMQUEUE_CONTRACT_ADDRESS = contracts[NETWORK_NAME].stemQueue
export const stemQueueContract = new Contract(STEMQUEUE_CONTRACT_ADDRESS, StemQueue.abi)
