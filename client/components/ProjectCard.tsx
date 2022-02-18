import Link from 'next/link'
import { Box, Card, CardActions, CardContent, Button, Typography } from '@mui/material'
import type { IProjectDoc } from '../models/project.model'

const styles = {
	card: {
		minWidth: '200px',
	},
	title: {},
	description: {},
	tags: {},
}

type ProjectCardProps = {
	details: IProjectDoc,
}

const ProjectCard = (props: ProjectCardProps): JSX.Element => {
	const { details } = props

	return (
		<Card sx={styles.card}>
			<CardContent>
				<Typography variant="h5" gutterBottom sx={styles.title}>
					{details.name}
				</Typography>
				<Typography gutterBottom sx={styles.description}>
					{details.description.slice(0, 60) + '...'}
				</Typography>
				<Typography sx={styles.tags} color="text.secondary">
					tags go here
				</Typography>
			</CardContent>
			<CardActions>
				<Link href={`/projects/${details._id}`} passHref>
					<Button size="small">View More</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

export default ProjectCard
