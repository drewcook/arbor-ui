import { Box, Tab, Tabs } from '@mui/material'
import type { ReactNode, SyntheticEvent } from 'react'
import { useState } from 'react'
import Notification from '../../components/Notification'
import ProjectDetails from '../../components/ProjectDetails/ProjectDetails'
import StemQueue from '../../components/StemQueue/StemQueue'
import type { IProjectDoc } from '../../models/project.model'

type ProjectDetailsContainerProps = {
	data: IProjectDoc
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

const ProjectDetailsContainer = (props: ProjectDetailsContainerProps): JSX.Element => {
	const { data } = props
	const [details, setDetails] = useState<IProjectDoc>(data)
	const [currentTab, setCurrentTab] = useState(0)
	const [uploadStemOpen, setUploadStemOpen] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')

	////////////////////////////////////////////////////////////////////////
	// Changing Tabs
	////////////////////////////////////////////////////////////////////////
	const handleChange = (event: SyntheticEvent, newValue: number) => {
		setCurrentTab(newValue)
	}

	const a11yProps = (index: number) => {
		return {
			id: `simple-tab-${index}`,
			'aria-controls': `simple-tabpanel-${index}`,
		}
	}

	////////////////////////////////////////////////////////////////////////
	// Stem Uploads
	////////////////////////////////////////////////////////////////////////
	const handleUploadStemOpen = (): void => {
		setUploadStemOpen(true)
	}

	const handleUploadStemClose = (): void => {
		setUploadStemOpen(false)
	}

	const onStemUploadSuccess = (projectData: IProjectDoc): void => {
		// Refresh UI
		setDetails(projectData)
		setSuccessOpen(true)
		setSuccessMsg("Success! You've uploaded a new stem to this project and become a contributor.")
		handleUploadStemClose()
	}

	////////////////////////////////////////////////////////////////////////
	// Stem Uploads
	////////////////////////////////////////////////////////////////////////
	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	return (
		<>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={currentTab} onChange={handleChange} aria-label="basic tabs example">
					<Tab label="Details" {...a11yProps(0)} />
					<Tab label="Stem Queue" {...a11yProps(1)} />
				</Tabs>
			</Box>
			<TabPanel value={currentTab} index={0}>
				<ProjectDetails
					details={details}
					uploadStemOpen={uploadStemOpen}
					handleUploadStemOpen={handleUploadStemOpen}
					handleUploadStemClose={handleUploadStemClose}
					onStemUploadSuccess={onStemUploadSuccess}
				/>
			</TabPanel>
			<TabPanel value={currentTab} index={1}>
				<StemQueue
					details={details}
					uploadStemOpen={uploadStemOpen}
					handleUploadStemOpen={handleUploadStemOpen}
					handleUploadStemClose={handleUploadStemClose}
					onStemUploadSuccess={onStemUploadSuccess}
				/>
			</TabPanel>
			{successOpen && <Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

export default ProjectDetailsContainer
