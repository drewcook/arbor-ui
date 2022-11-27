#! /bin/bash


name=$1

/Users/work/.cargo/bin/circom "$name".circom --r1cs --wasm
snarkjs r1cs export json "$name".r1cs "$name".r1cs.json
cat "$name".r1cs.json

node ./"$name"_js/generate_witness.js ./"$name"_js/"$name".wasm input.json witness.wtns

snarkjs zkey export verificationkey "$name"_final.zkey verification_key.json

snarkjs groth16 prove "$name"_final.zkey witness.wtns ./"$name"_js/proof.json ./"$name"_js/public.json

snarkjs groth16 verify verification_key.json ./"$name"_js/public.json ./"$name"_js/proof.json

snarkjs zkey export solidityverifier "$name"_final.zkey verifier.sol

snarkjs zkey export soliditycalldata ./"$name"_js/public.json ./"$name"_js/proof.json
