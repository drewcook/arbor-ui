import { Contract, providers } from 'ethers'
import StemQueue from '../web3/artifacts/contracts/StemQueue.sol/StemQueue.json'

// StemQueue contract
// TODO: Update these to be production values vs. local development
const contract = new Contract('0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE', StemQueue.abi)
const provider = new providers.JsonRpcProvider('http://localhost:8545')
export const stemQueueContract = contract.connect(provider.getSigner())
