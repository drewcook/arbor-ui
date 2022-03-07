import Link from 'next/link'
import { Button, Card, CardActions, CardContent, Chip, Typography } from '@mui/material'
import type { IProjectDoc } from '../models/project.model'

const styles = {
	card: {
		minWidth: '200px',
	},
	title: {},
	collaborators: {
		textTransform: 'uppercase',
		color: '#a8a8a8',
		fontWeight: 700,
		mb: 1,
	},
	description: {
		fontWeight: 300,
		mb: 2,
	},
	tag: {
		m: 1,
	},
	actions: {
		justifyContent: 'flex-end',
	},
}

type ProjectCardProps = {
	details: IProjectDoc
}

const ProjectCard = (props: ProjectCardProps): JSX.Element => {
	const { details } = props

	return (
		<Card sx={styles.card} elevation={2}>
			<CardContent>
				<Typography variant="h5" gutterBottom sx={styles.title}>
					{details.name}
				</Typography>
				<Typography variant="body2" sx={styles.collaborators}>
					{details.collaborators.length} Collaborator
					{details.collaborators.length === 1 ? '' : 's'} • {details.samples.length} Sample
					{details.samples.length === 1 ? '' : 's'}
				</Typography>
				<Typography gutterBottom sx={styles.description}>
					{details.description.slice(0, 60) + '...'}
				</Typography>
				{details.tags &&
					details.tags?.length > 0 &&
					details.tags?.map((tag: string) => (
						<Chip key={tag} label={tag} variant="filled" color="secondary" size="small" sx={styles.tag} />
					))}
			</CardContent>
			<CardActions sx={styles.actions}>
				<Link href={`/projects/${details._id}`} passHref>
					<Button color="secondary">View More</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

export default ProjectCard
