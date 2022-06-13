pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template StemQueueVote() {
    signal input voter;
    signal input contributors;
		signal input stemId;
		signal input queuedStemIds;
		signal output isValidVote;

		// 1. Check that the voter address is included in the project contributors address
		// Only contributors can cast votes for stems

		// 2. Check that the stemId being voted on is contained within the stem queue for the given project
		// Only a valid stem within the can be voted on for any respective project

		// For testing, return true for now
		isValidVote <== 1;
}

component main = StemQueueVote();
