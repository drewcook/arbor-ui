import fs from 'fs'
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/
const contractToBumpPath = '../contracts/verifier.sol'
const content = fs.readFileSync(contractToBumpPath, { encoding: 'utf-8' })
const bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0')
fs.writeFileSync(contractToBumpPath, bumped)
