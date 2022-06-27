import { Contract, providers } from 'ethers'
import PolyechoNFT from '../web3/artifacts/contracts/PolyechoNFT.sol/PolyechoNFT.json'
import StemQueue from '../web3/artifacts/contracts/StemQueue.sol/StemQueue.json'

/*
	TODO: Update these to be production values after launching on harmony devnet
	- Update contract addresses
	- Update RPC-URL to https://api.s0.ps.hmny.io/
*/

// Create our Provider instance
const provider = new providers.JsonRpcProvider('http://localhost:8545')

// PolyechoNFT contract
const polyechoNft = new Contract('0x7bc06c482dead17c0e297afbc32f6e63d3846650', PolyechoNFT.abi)
export const nftContract = polyechoNft.connect(provider.getSigner())

// StemQueue contract
const stemQueue = new Contract('0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d', StemQueue.abi)
export const stemQueueContract = stemQueue.connect(provider.getSigner())
