import { Grid } from '@mui/material'
import React from 'react'

import ProjectCard from './ProjectCard'

type RecentProjectActivityProps = {
	projects: any[]
}

const RecentProjectActivity = ({ projects }: RecentProjectActivityProps): JSX.Element => {
	return (
		<section>
			<Grid container spacing={3}>
				{projects.map(project => (
					<Grid item xs={12} sm={4} key={project._id}>
						<ProjectCard details={project} />
					</Grid>
				))}
			</Grid>
		</section>
	)
}

export default RecentProjectActivity
