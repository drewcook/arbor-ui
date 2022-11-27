pragma circom 2.0.3;

include "./node_modules/circomlib/circuits/poseidon.circom";

// Prove that the revealed secret and value correspond to the blinded bid
template GetHighestBidder (nBids) {
    // blindedbid = Poseidon(value, secret)
    signal input blindedBids[nBids];

    // each bid has a value and secret
    signal input bids[nBids][2];

    signal output highestBid[2];
    signal output bidsWithValidityStatus[nBids];

    component hashes[nBids];
    var highestVal = 0;
    var highestBlindedBid = 0;
    for (var i = 0; i < nBids; i++) {
      hashes[i] = Poseidon(2);
      hashes[i].inputs[0] <== bids[i][0];
      hashes[i].inputs[1] <== bids[i][1];

      if (hashes[i].out == blindedBids[i]) {
        // bid was valid
        if (bids[i][0] > highestVal) {
          // bid value is higher than previously recorded bid
          highestVal = bids[i][0];
          highestBlindedBid = blindedBids[i];
        }
      }
      // 0 if bid was invalid, 1 if valid 
      bidsWithValidityStatus[i] <-- hashes[i].out == blindedBids[i];

    }
    log(highestVal);

  highestBid[0] <-- highestVal;
  highestBid[1] <-- highestBlindedBid;

}

component main { public [ blindedBids ] } = GetHighestBidder(4);

