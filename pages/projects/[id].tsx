import { Container } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { createClient } from 'redis'

import ProjectDetailsContainer from '../../components/ProjectDetails/ProjectDetails.container'
import type { IProjectDoc } from '../../models/project.model'
import { get } from '../../utils/http'

type ProjectDetailsPageProps = {
	data: IProjectDoc | null
	blob: string
}

const ProjectPage: NextPage<ProjectDetailsPageProps> = props => {
	const { data, blob } = props

	return (
		<>
			<Head>
				<title>Arbor | Project Details</title>
			</Head>
			<Container maxWidth="xl" className="content-container">
				{data && <ProjectDetailsContainer data={data} blob={blob} />}
			</Container>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	// Get  project details from ID
	const projectId = context.query.id
	const res = await get(`/projects/${projectId}`)
	const data: IProjectDoc | null = res.success ? res.data : null

	const client = createClient({
		url: `redis://default:3ED83Ay8uxtcs1HlYI8J5spNeFr8TzEm@redis-15246.c80.us-east-1-2.ec2.cloud.redislabs.com:15246`,
	})

	await client.connect()

	const blob = await client.get(String(data?._id))

	return {
		props: {
			data,
			blob,
		},
	}
}

export default ProjectPage
