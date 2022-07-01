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
export const signer = provider.getSigner()


// PolyechoNFT contract
const localAddress_nft = '0x4C4a2f8c81640e47606d3fd77B353E87Ba015584'
const devnetAddress_nft = '0x7810D24738405b6B38ee8a6150E438Bc57595029'
const polyechoNft = new Contract(
	process.env.NODE_ENV === 'development' ? localAddress_nft : devnetAddress_nft,
	PolyechoNFT.abi,
)
export const nftContract = polyechoNft.connect(signer)

// StemQueue contract
const localAddress_queue = '0xDC11f7E700A4c898AE5CAddB1082cFfa76512aDD'
const devnetAddress_queue = '0x6785A60AdEb945C0597fF6E7ea4F1649662b2673'
const stemQueue = new Contract(
	process.env.NODE_ENV === 'development' ? localAddress_queue : devnetAddress_queue,
	StemQueue.abi,
)
export const stemQueueContract = stemQueue.connect(signer)
