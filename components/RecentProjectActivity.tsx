import { Card, CardContent, CardHeader, Grid } from '@mui/material'

import home_styles from '../styles/Home.styles'
import ProjectCard from './ProjectCard'
import styles from './ProjectCard.styles'

type RecentProjectActivityProps = {
	projects: any[]
}

const RecentProjectActivity = ({ projects }: RecentProjectActivityProps): JSX.Element => {
	return (
		<Card sx={styles.card} elevation={2}>
			<CardHeader sx={[home_styles.features, home_styles.heading, home_styles.featureBox]} title="Recent Activity" />
			<CardContent>
				<Grid container spacing={3}>
					{projects.map(project => (
						<Grid item xs={12} sm={4} key={project._id}>
							<ProjectCard details={project} />
						</Grid>
					))}
				</Grid>
			</CardContent>
		</Card>
	)
}

export default RecentProjectActivity
