import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'

const Faq = (): JSX.Element => {
	return (
		<>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel-1-content" id="panel-1-header">
					<Typography>What is the Arbor Protocol?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						The Arbor Protocol is a series of on-chain smart contracts that allow any number of users to collaborate
						with each other and co-create music NFTs by a means of contributing individual stems of music onto Arbor
						Projects. The protocol allows for the final NFT to yield sale profits and royalty splits amongst the
						co-creators in which the contributions of stems and the rules of profit splitting are governed by the
						creators themselves. The governance is managed via zero-knowledge proofs and all music files are stored in
						IPFS as well as the metadata around each stem and Arbor NFT.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel-2-content" id="panel-2-header">
					<Typography>What problems does Arbor solve?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography gutterBottom>
						There is a huge gap in allowing music producers and artists in two major areas of being a creator. The first
						is reaching an audience that is fully invested and connected to the artist in a meaningful and intimate way.
						The second is allow artists to get paid a fair sum for their creations. With big name music streaming
						platforms, artists get paid pennies on the dollar for every track play that occurs, and those plays are a
						huge uphill battle against the algorithms that be.
					</Typography>
					<Typography>
						Arbor solves this by connecting artists directly with the fans and collectors that enjoy their music while
						simultaneously getting paid in full for the value that their art holds via cryptocurrencies. This means of
						decentralization alleviates all barriers that come with trying to launch a new track on a big music
						streaming platform. Not only does Arbor provide this for a single artist releasing their own track, but it
						adds to that by allowing multiple artists to co-create a single track where all of them benefit from these
						features.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel-3-content" id="panel-3-header">
					<Typography>How did the idea for Arbor begin?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography gutterBottom>
						The Arbor Protocol was born out of the ETHDenver hackathon in 2022, by a small team of passionate developers
						and musicians. As seasoned musicians, the team understands how hard it is to connect with and find an
						audience for their music as well as knowing how little it pays while performing that music in clubs and
						music venues (usually just to sell more beer for the venue). The team also knows how much time and effort
						goes into producing tracks only to put them on streaming platforms and not get paid well for that hard work,
						while often not reaching many listeners due to the algorithms that are out of an artist&apos;s control.
					</Typography>
					<Typography>
						The idea for Arbor is driven by these pain points that have been experienced first hand, and hope to bring a
						fun and unique user experience for both artists and collectors while being backed by the security of the
						Ethereum blockchain and a set of robust smart contracts that removes all boundaries for allowing creators to
						get paid and share their music with others.
					</Typography>
				</AccordionDetails>
			</Accordion>
		</>
	)
}

export default Faq
