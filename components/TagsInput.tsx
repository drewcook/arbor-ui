import { useState } from 'react'

import { Box, Chip, TextField } from '@mui/material'

const styles = {
	tags: {
		mt: 1,
	},
	tag: {
		m: 1,
	},
}

type TagsInputProps = {
	tags: string[],
	onAdd: (tag: string) => void,
	onDelete: (tag: string) => void,
}

const TagsInput = (props: TagsInputProps): JSX.Element => {
	const { tags, onAdd, onDelete } = props
	const [currTag, setCurrTag] = useState('')

	const handleKeyDown = (e: { keyCode: number }) => {
		const { keyCode } = e
		// Add on Enter, allow multi word tags
		if (keyCode === 13) {
			// Only allow unique tags
			if (!tags.includes(currTag.trim())) onAdd(currTag)
			setCurrTag('')
		}
	}

	return (
		<Box sx={styles.wrapper}>
			<TextField
				sx={styles.input}
				label="Project Tags"
				variant="filled"
				margin="normal"
				value={currTag}
				onKeyDown={handleKeyDown}
				onChange={e => setCurrTag(e.target.value)}
				placeholder="Add multiple tags by hitting 'Enter' between each one"
				fullWidth
			/>
			<Box sx={styles.tags}>
				{tags.length > 0 &&
					tags.map(tag => (
						<Chip
							key={tag}
							variant="filled"
							color="secondary"
							label={tag}
							onDelete={() => onDelete(tag)}
							sx={styles.tag}
						/>
					))}
			</Box>
		</Box>
	)
}

export default TagsInput
