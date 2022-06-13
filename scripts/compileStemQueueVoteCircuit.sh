#!/bin/bash

cd circuits
mkdir StemQueueVote

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling stemQueueVote.circom..."

# compile circuit
circom stemQueueVote.circom --r1cs --wasm --sym -o ./StemQueueVote
snarkjs r1cs info StemQueueVote/stemQueueVote.r1cs

# Start a new zkey and make a contribution
snarkjs groth16 setup StemQueueVote/stemQueueVote.r1cs powersOfTau28_hez_final_10.ptau StemQueueVote/circuit_0000.zkey
snarkjs zkey contribute StemQueueVote/circuit_0000.zkey StemQueueVote/circuit_final.zkey --name="Polyecho Labs" -v -e="Making a unique contribution to the ceremony"
snarkjs zkey export verificationkey StemQueueVote/circuit_final.zkey StemQueueVote/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier StemQueueVote/circuit_final.zkey ../contracts/verifier.sol

cd ../..
