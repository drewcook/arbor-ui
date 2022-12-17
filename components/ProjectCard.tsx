import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { Box, Button, Card, CardActions, CardContent, Chip, Typography } from '@mui/material'
import Link from 'next/link'

import type { IProjectDoc } from '../models/project.model'
import styles from './ProjectCard.styles'

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
					{details.stems.length} Stem
					{details.stems.length === 1 ? '' : 's'} • {details.trackLimit} Stem Max • {details.collaborators.length}{' '}
					Collaborator
					{details.collaborators.length === 1 ? '' : 's'}
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
					<Button color="primary">View Details</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

export default ProjectCard
