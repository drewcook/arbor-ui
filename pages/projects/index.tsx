import { Box, Button, Container, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import ProjectCard from '../../components/ProjectCard'
import { IProjectDoc } from '../../models/project.model'
import { get } from '../../utils/http'

const styles = {
	title: {
		textAlign: 'center',
		mb: 4,
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
		<div>
			<Head>
				<title>PolyEcho | Explore Music Projects</title>
				<meta
					name="description"
					content="PolyEcho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors."
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="lg">
					{data ? (
						<>
							<Typography variant="h4" component="h1" sx={styles.title}>
								Explore Projects
							</Typography>
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
				</Container>
			</main>

			<AppFooter />
		</div>
	)
}

ProjectsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async () => {
	const res = await get(`/projects`)
	const data: IProjectDoc[] | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default ProjectsPage
