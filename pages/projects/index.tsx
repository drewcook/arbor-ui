import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Footer from '../../components/Footer'
import AppHeader from '../../components/AppHeader'
import { Container, Grid, Typography } from '@mui/material'
import { get } from '../../utils/http'
import { IProjectDoc } from '../../models/project.model'
import ProjectCard from '../../components/ProjectCard'

const styles = {
	eyebrow: {
		color: '#666',
	},
	noProjects: {
		textAlign: 'center',
		marginY: 4,
	},
}

type ProjectsPageProps = {
	data: IProjectDoc[] | null,
}

const ProjectsPage: NextPage<ProjectsPageProps> = props => {
	const { data } = props

	return (
		<div>
			<Head>
				<title>ETHDenver Hack Web App | Explore Music Projects</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="lg">
					{data ? (
						<>
							<Typography gutterBottom variant="h5" component="h1" sx={styles.eyebrow}>
								Explore Projects
							</Typography>
							<Grid container spacing={4}>
								{data.map(project => (
									<Grid item sm={6} md={4} key={project._id}>
										<ProjectCard details={project} />
									</Grid>
								))}
							</Grid>
						</>
					) : (
						<Typography sx={styles.noProjects}>
							There are currently no projects, create one!
						</Typography>
					)}
				</Container>
			</main>

			<Footer />
		</div>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	const res = await get(`/projects`)
	let data: IProjectDoc[] | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default ProjectsPage
