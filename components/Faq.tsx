import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'

const Faq = (): JSX.Element => {
	return (
		<>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
					<Typography>Why Arbor?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias necessitatibus accusantium praesentium
						maiores inventore culpa aliquam voluptas obcaecati nesciunt eius!
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
					<Typography>What&apos;s the idea behind music as NFT&apos;s?</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam incidunt cum officia nihil quisquam velit
						eligendi unde tempora autem accusamus alias ea quo distinctio ut quos eius, soluta earum aliquam accusantium
						explicabo! Quisquam ab, id consectetur unde impedit totam maxime.
					</Typography>
				</AccordionDetails>
			</Accordion>
		</>
	)
}

export default Faq
