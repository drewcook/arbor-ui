import { Contract, providers } from 'ethers'
import PolyechoNFT from '../contracts/PolyechoNFT.json'
import StemQueue from '../contracts/StemQueue.json'
/*
	NOTE: Update these to be production values after launching them on any network
	- These should be up to date at all times for the latest deployments
	- Update contract addresses
	- Update RPC-URL to https://api.s0.ps.hmny.io/
*/

// Create our Provider instance
export const provider = new providers.JsonRpcProvider(
	process.env.NODE_ENV === 'development' ? 'http://localhost:8545' : 'https://api.s0.ps.hmny.io',
)

// PolyechoNFT contract
const localAddress_nft = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const devnetAddress_nft = '0x7810D24738405b6B38ee8a6150E438Bc57595029'

export const polyechoNftContract = new Contract(
	process.env.NODE_ENV === 'development' ? localAddress_nft : devnetAddress_nft,
	PolyechoNFT.abi,
)

// StemQueue contract
const localAddress_queue = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const devnetAddress_queue = '0x6785A60AdEb945C0597fF6E7ea4F1649662b2673'

export const stemQueueContract = new Contract(
	process.env.NODE_ENV === 'development' ? localAddress_queue : devnetAddress_queue,
	StemQueue.abi,
)
