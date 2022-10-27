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
	// Last deployed: 10/21/22
	'Polygon Mainnet': {
		nft: '0xB1Ce21D0a6325ea34E32d82a30B1067dE206e040',
		verifier: '0xB77940118b82c9874bBB6E7989C3B163f468ab2b',
		poseidonT3: '0x94B16C718C106697d7E99B0Cf059BaB614620Fc8',
		incrementalBinaryTree: '0x955B7Aa2966B8a8039F0676D3CA2c3Aab9057929',
		stemQueue: '0xb421fbf2bC2905F6E377ddf83926A504e3C917BE',
	},
	// Last deployed: 10/21/22
	'Polygon Testnet': {
		nft: '0x531e468A8b41F76db4Ce2A35e8E4Dd7d4a9CD7c9',
		verifier: '0x56764a37d4C2d6D45Db1FAE0FaD9372e97DF74dB',
		poseidonT3: '0xEA2C42A008DEe4e9680d29d98b14e9a130f5148a',
		incrementalBinaryTree: '0xd207cafd34D6df9Fa308EcE980063b663f3E3f00',
		stemQueue: '0xe28b6394D3d0D7F6Cfce2Db111D6b159f77688AF',
	},
	// Last deployed: 09/30/22
	'Harmony Mainnet': {
		nft: '0x5663E41c235025fA3AE8B02d8a5082FB985eB791',
		verifier: '0xAb3a31d86819Bbd3C56DaBCBB926fe6e60824C23',
		poseidonT3: '0x4141563575DE5c8bD8159F14bF7e5037D38D00C2',
		incrementalBinaryTree: '0xbf805FDc12BD94c087Fa1c82DbBe12707aaCdB24',
		stemQueue: '0x6F6f53296049149a02373E3458fb105171481268',
	},
	// Last deployed: 10/06/22
	'Harmony Testnet': {
		nft: '0xC4fDca8B87212BE38DB3F8F4c16DbD7A2fC9ee3d',
		verifier: '0xb375562CA63E274d469EC658eaA8762404ec3C2F',
		poseidonT3: '0xB4Fa01219D84496FFd9bD1bD2555D56DDe706CeC',
		incrementalBinaryTree: '0xBbAf5e49f408C94c3B67981504dC5C224a590066',
		stemQueue: '0x2F4BB09Cf3CD39413d5C509d42d6F03bFC91Da74',
	},
	// Last deployed: 10/06/22
	'Harmony Devnet': {
		nft: '0x4A7D03001aec68b1E68600bB169F43c65e2ae85E',
		stemQueue: '0x826342311Bee3Db6d6F44c0250E4d5BdfD19f186',
		verifier: '0x64a3109799fBd3B9Ac51Ba0824c2b2C773F00dF8',
		poseidonT3: '0xA95b027b62795cDA8d3d52Dc8384b0286815bf9D',
		incrementalBinaryTree: '0x6640D13cf7D8eBEd2A55fdf75E4D36C8dc08F665',
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
