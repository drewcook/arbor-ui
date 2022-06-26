import { Contract, providers } from 'ethers'
import StemQueue from '../web3/artifacts/contracts/StemQueue.sol/StemQueue.json'

// StemQueue contract
const contract = new Contract('0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0', StemQueue.abi)
const provider = new providers.JsonRpcProvider('http://localhost:8545')
export const stemQueueContract = contract.connect(provider.getSigner())
