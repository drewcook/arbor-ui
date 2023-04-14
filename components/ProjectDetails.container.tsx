import { Box, Tab, Tabs } from '@mui/material'
import { ReactNode, SyntheticEvent, useEffect, useState } from 'react'

import type { ProjectDoc } from '../models'
import Notification from './Notification'
import ProjectDetails from './ProjectDetails'
import StemQueue from './StemQueue'
import { useWeb3 } from './Web3Provider'

type ProjectDetailsContainerProps = {
	data: ProjectDoc
}

interface TabPanelProps {
	children?: ReactNode
	index: number
	value: number
}

const TabPanel = (props: TabPanelProps) => {
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
	const [details, setDetails] = useState<ProjectDoc>(data)
	const [currentTab, setCurrentTab] = useState(0)
	const [uploadStemOpen, setUploadStemOpen] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const { currentUser } = useWeb3()

	const [userIsRegisteredVoter, setUserRegistration] = useState<boolean>(
		currentUser ? currentUser.registeredGroupIds.includes(details.votingGroupId) : false,
	)
	const [userIsCollaborator, setUserCollaborator] = useState<boolean>(
		currentUser ? details.collaborators.includes(currentUser.address) : false,
	)

	/*
		Update user registration and collaborator status if the current user changes
	*/
	useEffect(() => {
		if (!currentUser) return
		const isRegisteredVoter = currentUser.registeredGroupIds.includes(details.votingGroupId)
		const isCollaborator = details.collaborators.includes(currentUser.address)
		setUserRegistration(isRegisteredVoter)
		setUserCollaborator(isCollaborator)
	}, [currentUser?.registeredGroupIds]) /* eslint-disable-line react-hooks/exhaustive-deps */

	////////////////////////////////////////////////////////////////////////
	// Changing Tabs
	////////////////////////////////////////////////////////////////////////
	const handleTabChange = (event: SyntheticEvent, newValue: number) => {
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

	const onStemUploadSuccess = (projectData: ProjectDoc): void => {
		// Refresh UI
		setDetails(projectData)
		setSuccessOpen(true)
		setSuccessMsg("Success! You've uploaded a new stem to the project stem queue.")
		handleUploadStemClose()
		setCurrentTab(1)
	}

	////////////////////////////////////////////////////////////////////////
	// Stem Queue Voting Registration
	////////////////////////////////////////////////////////////////////////
	const onRegisterSuccess = (projectData: ProjectDoc): void => {
		// Refresh UI
		setDetails(projectData)
		setSuccessOpen(true)
		setSuccessMsg(`Success! You've regstered to be a voting member for this project's stem queue.`)
	}

	////////////////////////////////////////////////////////////////////////
	// Stem Queue Voting
	////////////////////////////////////////////////////////////////////////
	const onVoteSuccess = (projectData: ProjectDoc, stemName: string): void => {
		// Refresh UI
		setDetails(projectData)
		setSuccessOpen(true)
		setSuccessMsg(`Success! You've anonymously voted for '${stemName}' to be included on the project.`)
	}

	////////////////////////////////////////////////////////////////////////
	// Stem Queue Approval
	////////////////////////////////////////////////////////////////////////
	const onApprovedSuccess = (projectData: ProjectDoc, stemName: string): void => {
		// Refresh UI
		setDetails(projectData)
		setSuccessOpen(true)
		setSuccessMsg(`Success! The stem '${stemName}' has been approved and added to the project.`)
		setCurrentTab(0)
	}

	////////////////////////////////////////////////////////////////////////
	// Notification Close
	////////////////////////////////////////////////////////////////////////
	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	const onFailure = (msg: string): void => {
		setErrorOpen(true)
		setErrorMsg(msg)
	}

	return (
		<>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={currentTab} onChange={handleTabChange} aria-label="basic tabs example">
					<Tab label="Details" {...a11yProps(0)} />
					<Tab label={`Stem Queue (${details.queue.length})`} {...a11yProps(1)} />
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
					userIsRegisteredVoter={userIsRegisteredVoter}
					userIsCollaborator={userIsCollaborator}
					uploadStemOpen={uploadStemOpen}
					handleUploadStemOpen={handleUploadStemOpen}
					handleUploadStemClose={handleUploadStemClose}
					onStemUploadSuccess={onStemUploadSuccess}
					onRegisterSuccess={onRegisterSuccess}
					onVoteSuccess={onVoteSuccess}
					onApprovedSuccess={onApprovedSuccess}
					onFailure={onFailure}
				/>
			</TabPanel>
			{successOpen && <Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

export default ProjectDetailsContainer
