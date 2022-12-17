import { Card, CardContent, CardHeader, Grid } from '@mui/material'
import React from 'react'

import ProjectCard from './ProjectCard'
import styles from './ProjectCard.styles'

type RecentProjectActivityProps = {
	projects: any[]
}

const RecentProjectActivity = ({ projects }: RecentProjectActivityProps): JSX.Element => {
	return (
		<Card sx={styles.card} elevation={2}>
			<CardHeader title="Recent Activity" />
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
