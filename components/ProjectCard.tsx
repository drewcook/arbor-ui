import Link from 'next/link'
import { Button, Card, CardActions, CardContent, Chip, Typography } from '@mui/material'
import type { IProjectDoc } from '../models/project.model'

const styles = {
	card: {
		minWidth: '200px',
	},
	title: {},
	description: {},
	tag: {
		m: 1,
	},
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
				{details.tags.length > 0 &&
					details.tags.map((tag: string) => (
						<Chip
							key={tag}
							label={tag}
							variant="filled"
							color="secondary"
							size="small"
							sx={styles.tag}
						/>
					))}
			</CardContent>
			<CardActions>
				<Link href={`/projects/${details._id}`} passHref>
					<Button size="small" color="secondary">
						View More
					</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

export default ProjectCard
