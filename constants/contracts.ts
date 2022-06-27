import { Contract, providers } from 'ethers'
import StemQueue from '../web3/artifacts/contracts/StemQueue.sol/StemQueue.json'

// StemQueue contract
// TODO: Update these to be production values after launching on harmony devnet
const contract = new Contract('0xCD8a1C3ba11CF5ECfa6267617243239504a98d90', StemQueue.abi) // Update to devnet address
const provider = new providers.JsonRpcProvider('http://localhost:8545') // Update to https://api.s0.ps.hmny.io/
export const stemQueueContract = contract.connect(provider.getSigner())
