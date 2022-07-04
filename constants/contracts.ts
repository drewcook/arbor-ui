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
	// Last deployed: 07/04/22
	'Polygon Testnet': {
		nft: '0x9469c65fEe833d4a20092239d3D79563a287559e',
		stemQueue: '0xB77940118b82c9874bBB6E7989C3B163f468ab2b',
		verifier: '0xEF8a352614aB42f662FBeb870868Bb511491d90c',
		poseidonT3: '0x29FfdD421F828dDcA54024cc86B8DEb2B627dD99',
		incrementalBinaryTree: '0xB1Ce21D0a6325ea34E32d82a30B1067dE206e040',
	},
	// Last deployed: 07/03/22
	'Harmony Devnet': {
		nft: '0x25757638772b64118aCA8Cfb6A7C265b43a9fe09',
		stemQueue: '0xC37f1694e4C43FcC21869456319d09730c476321',
		verifier: '0x2B99203DA4E02aFCbc8b0e4AC21C0505Aaa36fe8',
		poseidonT3: '0x43DBAB2e99fEaaFF1479A284f0428F089809ff18',
		incrementalBinaryTree: '0x02c4018D3A1966813a56bEbe1D89A7B8ec34b01E',
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
