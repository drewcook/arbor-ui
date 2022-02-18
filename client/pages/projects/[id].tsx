import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import { Container, Divider, Grid, Typography } from '@mui/material'
import { get } from '../../utils/http'
import { IProjectDoc } from '../../models/project.model'

const styles = {
	eyebrow: {
		color: '#666',
	},
	error: {
		textAlign: 'center',
		marginY: 4,
	},
}

type ProjectPageProps = {
	data: IProjectDoc | null,
}

const ProjectPage: NextPage<ProjectPageProps> = props => {
	const { data } = props

	return (
		<>
			<Head>
				<title>ETHDenver Hack Web App | Create A New Project</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Header />

			<main>
				<Container maxWidth="lg">
					{data ? (
						<>
							<Grid container spacing={4}>
								<Grid item md={9}>
									<Typography gutterBottom variant="h5" component="h1" sx={styles.eyebrow}>
										Project Details
									</Typography>
									<Typography gutterBottom variant="h3" component="h2">
										{data.name}
									</Typography>
									<Typography>{data.description}</Typography>
									<Divider />
									sound clips will go here
								</Grid>
								<Grid item md={3}></Grid>
							</Grid>
						</>
					) : (
						<Typography sx={styles.error} color="error">
							Sorry, no details were found for this project.
						</Typography>
					)}
				</Container>
			</main>

			<Footer />
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	const projectId = context.query.id
	const res = await get(`/projects/${projectId}`)
	let data: IProjectDoc | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default ProjectPage
