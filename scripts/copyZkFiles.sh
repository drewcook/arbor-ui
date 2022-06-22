#!/bin/bash

cd circuits/stemQueueVote/compiled

# Copy the verifier
cp ./stemQueueVotePlonkVerifier.sol ../../../contracts

# Create the zkproof folder if it does not exist
cd ../../../
mkdir -p zkproof2

# Copy the wasm file to test smart contracts
cp ./circuits/stemQueueVote/compiled/stemQueueVote_js/stemQueueVote.wasm zkproof

# Copy the final zkey file to test smart contracts
cp ./circuits/stemQueueVote/compiled/stemQueueVote_final.zkey zkproof
