import { Box, Button, Container, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'

import ProjectCard from '../../components/ProjectCard'
import { get } from '../../lib/http'
import { ProjectDoc } from '../../models'
import { indexStyles as styles } from '../../styles/Projects.styles'

const propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string.isRequired,
		}),
	),
}

type ProjectsPageProps = PropTypes.InferProps<typeof propTypes>

const ProjectsPage: NextPage<ProjectsPageProps> = props => {
	const { data } = props

	return (
		<>
			<Head>
				<title>Arbor | Explore Audio Projects</title>
			</Head>
			<Container maxWidth="xl" className="content-container">
				{data ? (
					<>
						<Typography variant="h4" component="h1" sx={styles.title}>
							Arbor Audio Projects
						</Typography>
						<Container maxWidth="sm">
							<Typography variant="h5" sx={styles.subtitle}>
								Explore the ecosystem for unique music, collaborate and build with others, create something one of a
								kind.
							</Typography>
						</Container>
						{data.length > 0 ? (
							<Grid container spacing={4}>
								{data.map(project => (
									<Grid item sm={6} md={4} key={project?._id}>
										<ProjectCard details={project} />
									</Grid>
								))}
							</Grid>
						) : (
							<Box sx={styles.noProjects}>
								<Typography sx={styles.noProjectsMsg}>No projects to show. Create one!</Typography>
								<Link href="/projects/new" passHref>
									<Button variant="contained" color="secondary">
										Create Project
									</Button>
								</Link>
							</Box>
						)}
					</>
				) : (
					<Typography sx={styles.noProjects}>Something went wrong. Try refreshing.</Typography>
				)}
			</Container>
		</>
	)
}

ProjectsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async () => {
	// Get all Projects
	const res = await get(`/projects`)
	const data: ProjectDoc[] | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default ProjectsPage
