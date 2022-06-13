import type { ReactNode, SyntheticEvent } from 'react'
import { useState } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import type { IProjectDoc } from '../../models/project.model'
import ProjectDetails from '../../components/ProjectDetails/ProjectDetails'
import { get } from '../../utils/http'
import StemQueue from '../../components/StemQueue/StemQueue'
import { Box, Tabs, Tab } from '@mui/material'

export type ProjectDetailsPageProps = {
	data: IProjectDoc | null
}

interface TabPanelProps {
	children?: ReactNode
	index: number
	value: number
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`project-tabpanel-${index}`}
			aria-labelledby={`project-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
		</div>
	)
}

const ProjectPage: NextPage<ProjectDetailsPageProps> = props => {
	const { data } = props
	const [value, setValue] = useState(0)

	const handleChange = (event: SyntheticEvent, newValue: number) => {
		setValue(newValue)
	}

	const a11yProps = (index: number) => {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		}
	}

	return (
		<>
			<Head>
				<title>Polyecho | Project Details</title>
			</Head>
			{data && (
				<>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
							<Tab label="Details" {...a11yProps(0)} />
							<Tab label="Stem Queue" {...a11yProps(1)} />
						</Tabs>
					</Box>
					<TabPanel value={value} index={0}>
						<ProjectDetails data={data} />
					</TabPanel>
					<TabPanel value={value} index={1}>
						<StemQueue />
					</TabPanel>
				</>
			)}
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	// Get project details from ID
	const projectId = context.query.id
	const res = await get(`/projects/${projectId}`)
	const data: IProjectDoc | null = res.success ? res.data : null

	return {
		props: {
			data,
		},
	}
}

export default ProjectPage
