import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import { Container, Typography } from '@mui/material'
import type { ProjectData } from '../api/project/[id]'
import { get } from '../../utils/http'

type ProjectPageProps = {
	data: ProjectData,
}

const ProjectPage: NextPage = (props: ProjectPageProps) => {
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
					<Typography variant="h1">Project Details {data.id}</Typography>
				</Container>
			</main>

			<Footer />
		</>
	)
}

export async function getServerSideProps(context) {
	const projectId = context.query.id
	const res: ProjectData = await get(`/project/${projectId}`)
	console.log('got project data', { res })
	// const { id, name } = res

	return {
		props: {
			data: { id: '0', name: 'fail' },
		},
	}
}

export default ProjectPage
