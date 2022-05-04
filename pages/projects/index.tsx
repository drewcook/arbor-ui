import { Box, Button, Container, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import ProjectCard from '../../components/ProjectCard'
import { IProjectDoc } from '../../models/project.model'
import { get } from '../../utils/http'

const styles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		mb: 2,
	},
	subtitle: {
		fontStyle: 'italic',
		fontWeight: 300,
		textAlign: 'center',
		mb: 7,
	},
	noProjects: {
		textAlign: 'center',
	},
	noProjectsMsg: {
		fontSize: '1.5rem',
		color: '#555',
		mb: 3,
	},
}

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
				<title>Polyecho | Explore Music Projects</title>
			</Head>
			{data ? (
				<>
					<Typography variant="h4" component="h1" sx={styles.title}>
						Polyecho Music Projects
					</Typography>
					<Container maxWidth="sm">
						<Typography variant="h5" sx={styles.subtitle}>
							Explore the ecosystem for unique music, collaborate and build with others, create something one of a kind.
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
				<Typography sx={styles.noProjects}>Something went wrong</Typography>
			)}
		</>
	)
}

ProjectsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async () => {
	// Get all Projects
	const res = await get(`/projects`)
	const data: IProjectDoc[] | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default ProjectsPage
