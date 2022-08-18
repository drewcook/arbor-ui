import { Contract, providers } from 'ethers'
import PolyechoNFT from '../contracts/PolyechoNFT.json'
import StemQueue from '../contracts/StemQueue.json'
import { NETWORK_NAME, NETWORK_RPC } from './networks'

/******************************************************************************
	NOTE: Update these values after each new deployment to the relative network
*******************************************************************************/

// Legacy PolyechoNFT deployments:
// Rinkeby '0xe9b33abb18c5ebe1edc1f15e68df651f1766e05e'
// Kovan '0xaeca10e3d2db048db77d8c3f86a9b013b0741ba2'
// Polygon Testnet '0xBd0136694e9382127602abFa5AA0679752eaD313'

const contracts = {
	// Last deployed: 07/03/22
	Localhost: {
		nft: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
		stemQueue: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
		verifier: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
		poseidonT3: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
		incrementalBinaryTree: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
	},
	// Last deployed: 07/03/22
	'Polygon Mainnet': {
		nft: '0x6F6f53296049149a02373E3458fb105171481268',
		stemQueue: '0x16480B6d607952090fa4948EC75395659cC7D32A',
		verifier: '0x7810D24738405b6B38ee8a6150E438Bc57595029',
		poseidonT3: '0xe48fe3C863EDaD6c33EE9e4b51fcaFf5d48Ca9D3',
		incrementalBinaryTree: '0x559975Ff0024FBfF2fb9c9E8553c7263F691515d',
	},
	// Last deployed: 07/03/22
	'Polygon Testnet': {
		nft: '0x5121f4A8300e4Fda4Ff8FF695cA7873111C420ea',
		stemQueue: '0x5616971539C1d6aCb632A997436f66eA35f66CBC',
		verifier: '0xA6B0e5Bbd764d8DE2168B034cDbAB121eFDDce23',
		poseidonT3: '0xf6c55e9fAeeaa214f4B23c92e0C88953D19e3dD0',
		incrementalBinaryTree: '0x410c16A302d7672a9bEEBE6aF0E4c37122244E13',
	},
	// Last deployed: 07/03/22
	'Harmony Devnet': {
		nft: '0x94217E9A31517eB3737221C278ad176372Bc1e80',
		stemQueue: '0xE0E908F445bcDCa0a633290B70dde9eF6AeC202B',
		verifier: '0x6C43A325b7c340FE60F0C7BB91097343156c49e3',
		poseidonT3: '0xf5a4B9a46F0540b2E021991B70DbCcc3858C0755',
		incrementalBinaryTree: '0x126041909dA9f7C78658b9020A860da7f5DcFcDD',
	},
}

// Create our Provider instance
export const provider = new providers.JsonRpcProvider(NETWORK_RPC)

// NOTE: We could add in instances of the other three contracts, but currently there is no direct usage of them.

// PolyechoNFT contract
export const NFT_CONTRACT_ADDRESS = contracts[NETWORK_NAME].nft
export const polyechoNftContract = new Contract(NFT_CONTRACT_ADDRESS, PolyechoNFT.abi)

// StemQueue contract
export const STEMQUEUE_CONTRACT_ADDRESS = contracts[NETWORK_NAME].stemQueue
export const stemQueueContract = new Contract(STEMQUEUE_CONTRACT_ADDRESS, StemQueue.abi)
