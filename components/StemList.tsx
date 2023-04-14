import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow, { TableRowProps } from '@mui/material/TableRow'
import getBlobDuration from 'get-blob-duration'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'

import formatAddress from '../utils/formatAddress'
import formatDate from '../utils/formatDate'
import formatLength from '../utils/formatLength'
import formatStemName from '../utils/formatStemName'
import { stemTypesToColor } from './ArborThemeProvider'
import styles from './StemList.styles'

interface StyledTableRowProps extends TableRowProps {
	type?: string
}

const StyledTableRow = styled(TableRow, { shouldForwardProp: prop => prop !== 'type' })<StyledTableRowProps>(
	({ type, theme }) => ({
		'th, td': {
			border: 0,
		},
		...(type && {
			borderLeft: `15px solid ${stemTypesToColor[type] || '#dadada'}`,
			borderBottom: `1px solid ${theme.palette.divider}`,
		}),
	}),
)

const StemList = (props: any) => {
	const { details } = props
	const [lengths, setLengths] = useState<Array<any>>([])

	useEffect(() => {
		details.forEach(d => {
			if (d?.audioHref) {
				fetch(new URL(d.audioHref)).then(async res => {
					const blob = await res.blob()
					getBlobDuration(blob).then(length => {
						setLengths(l => [...l, length])
					})
				})
			}
		})
	}, [details])

	if (!details) return null

	return (
		<TableContainer component={Paper}>
			<Table aria-label="collapsible table">
				<TableHead>
					<TableRow
						sx={{
							th: {
								backgroundColor: '#1B2021',
							},
						}}
					>
						<TableCell variant="head" width={50} />
						<TableCell variant="head">TITLE</TableCell>
						<TableCell variant="head" align="right">
							LENGTH
						</TableCell>
						<TableCell variant="head" align="right">
							DATE UPLOADED
						</TableCell>
						<TableCell variant="head" align="right">
							UPLOADED BY
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{details.map((stem, i) => (
						<Fragment key={stem._id}>
							<StyledTableRow type={stem.type}>
								<TableCell>
									<IconButton aria-label="row">
										<PlayCircleIcon sx={styles.icon} />
									</IconButton>
								</TableCell>
								<TableCell component="th" scope="row">
									{formatStemName(stem.name)}
								</TableCell>
								<TableCell align="right">{formatLength(parseInt(lengths[i]))}</TableCell>
								<TableCell align="right">{formatDate(stem.createdAt)}</TableCell>
								<TableCell align="right">
									<Link href={`/users/${stem.createdBy}`}>{formatAddress(stem.createdBy)}</Link>
								</TableCell>
							</StyledTableRow>
						</Fragment>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

export default StemList
