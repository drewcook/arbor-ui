import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { Box, Button, Card, CardActions, CardContent, Chip, Typography } from '@mui/material'
import Link from 'next/link'
import type { IProjectDoc } from '../models/project.model'

const styles = {
	limitReachedChip: {
		textTransform: 'uppercase',
		fontWeight: 800,
		fontSize: '1rem',
		position: 'absolute',
		top: '1.5rem',
		right: '-1rem',
		backgroundColor: '#ff399f',
		py: 2.5,
		color: '#fff',
		zIndex: 1,
	},
	card: {
		minWidth: '200px',
		position: 'relative',
		overflow: 'visible',
	},
	cardMedia: {
		backgroundColor: '#111',
		borderBottom: '3px solid #4CE79D',
		py: 1,
		px: 1.5,
	},
	cardMediaIcon: {
		color: '#fff',
		fontSize: '2rem',
	},
	collaborators: {
		textTransform: 'uppercase',
		color: '#a8a8a8',
		fontWeight: 600,
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
	details: IProjectDoc | any
}

const ProjectCard = (props: ProjectCardProps): JSX.Element => {
	const { details } = props
	const limitReached = details ? details.stems.length >= details.trackLimit : false

	return (
		<Card sx={styles.card} elevation={2}>
			{limitReached && <Chip label="Track Limit Reached" size="medium" sx={styles.limitReachedChip} />}
			<Box sx={styles.cardMedia}>
				<QueueMusicIcon sx={styles.cardMediaIcon} />
			</Box>
			<CardContent>
				<Typography variant="h5" gutterBottom>
					{details.name}
				</Typography>
				<Typography variant="body2" sx={styles.collaborators}>
					{details.collaborators.length} Collaborator
					{details.collaborators.length === 1 ? '' : 's'} • {details.stems.length} Stem
					{details.stems.length === 1 ? '' : 's'}
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
					<Button color="secondary">View Details</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

export default ProjectCard
