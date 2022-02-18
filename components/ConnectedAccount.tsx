import { Box, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useWeb3 } from './Web3Provider'

const styles = {
	wrapper: {
		display: 'flex',
		justifyContent: 'right',
		alignItems: 'center',
	},
}

const ConnectedAccount = (): JSX.Element => {
	const [currentAccount, setCurrentAccount] = useState(null)
	const { accounts } = useWeb3()

	useEffect(() => {
		setCurrentAccount(accounts[0])
	}, [])

	return (
		<Box sx={styles.wrapper}>
			<IconButton></IconButton>
			<Typography variant="overline">{currentAccount}</Typography>
		</Box>
	)
}

export default ConnectedAccount
