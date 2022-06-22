#!/bin/bash

cd circuits/stemQueueVote

# Variable to store the name of the circuit
CIRCUIT=stemQueueVote

# In case there is a circuit name as input
if [ "$1" ]; then
    CIRCUIT=$1
fi

# Generate the witness.wtns
node compiled/${CIRCUIT}_js/generate_witness.js compiled/${CIRCUIT}_js/${CIRCUIT}.wasm input.json compiled/${CIRCUIT}_js/witness.wtns
