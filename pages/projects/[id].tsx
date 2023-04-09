import { Box, Button, Container, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import ProjectDetailsContainer from '../../components/ProjectDetails.container'
import { get } from '../../lib/http'
import type { IProjectDoc } from '../../models/project.model'

type ProjectDetailsPageProps = {
	data: IProjectDoc | null
}

const ProjectPage: NextPage<ProjectDetailsPageProps> = props => {
	const { data } = props

	return (
		<>
			<Head>
				<title>Arbor | Project Details</title>
			</Head>
			<Container maxWidth="xl" className="content-container">
				{data ? (
					<ProjectDetailsContainer data={data} />
				) : (
					<Box textAlign="center">
						<Typography mb={4}>
							Sorry, there are no details to show for this project. The ID being used may exist.
						</Typography>
						<Link href="/projects">
							<Button variant="contained" color="secondary">
								Back To Projects
							</Button>
						</Link>
					</Box>
				)}
			</Container>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	// Get project details from ID
	const projectId = context.query.id

	if (projectId !== '[object Blob]') {
		const res = await get(`/projects/${projectId}`)
		const data: IProjectDoc | null = res.success ? res.data : null
		return {
			props: {
				data,
			},
		}
	}

	// Fallback, typically if server returns a 404 or 400
	return { props: { data: null } }
}

export default ProjectPage
