// import { useEffect } from 'react'
// import PropTypes from 'prop-types'
// import { Chip, TextField } from '@mui/material'
// import Downshift from 'downshift'

// export default function TagsInput({ ...props }) {
// 	const { selectedTags, placeholder, tags, ...other } = props
// 	const [inputValue, setInputValue] = React.useState('')
// 	const [selectedItem, setSelectedItem] = React.useState([])
// 	useEffect(() => {
// 		setSelectedItem(tags)
// 	}, [tags])
// 	useEffect(() => {
// 		selectedTags(selectedItem)
// 	}, [selectedItem, selectedTags])

// 	function handleKeyDown(event) {
// 		if (event.key === 'Enter') {
// 			const newSelectedItem = [...selectedItem]
// 			const duplicatedValues = newSelectedItem.indexOf(event.target.value.trim())

// 			if (duplicatedValues !== -1) {
// 				setInputValue('')
// 				return
// 			}
// 			if (!event.target.value.replace(/\s/g, '').length) return

// 			newSelectedItem.push(event.target.value.trim())
// 			setSelectedItem(newSelectedItem)
// 			setInputValue('')
// 		}
// 		if (selectedItem.length && !inputValue.length && event.key === 'Backspace') {
// 			setSelectedItem(selectedItem.slice(0, selectedItem.length - 1))
// 		}
// 	}
// 	function handleChange(item) {
// 		let newSelectedItem = [...selectedItem]
// 		if (newSelectedItem.indexOf(item) === -1) {
// 			newSelectedItem = [...newSelectedItem, item]
// 		}
// 		setInputValue('')
// 		setSelectedItem(newSelectedItem)
// 	}

// 	const handleDelete = item => () => {
// 		const newSelectedItem = [...selectedItem]
// 		newSelectedItem.splice(newSelectedItem.indexOf(item), 1)
// 		setSelectedItem(newSelectedItem)
// 	}

// 	function handleInputChange(event) {
// 		setInputValue(event.target.value)
// 	}
// }

// const TagsInputField = (): JSX.Element => {
// 	return (
// 		<Downshift
// 			id="downshift-multiple"
// 			inputValue={inputValue}
// 			onChange={handleChange}
// 			selectedItem={selectedItem}
// 		>
// 			{({ getInputProps }) => {
// 				const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
// 					onKeyDown: handleKeyDown,
// 					placeholder,
// 				})
// 				return (
// 					<div>
// 						<TextField
// 							InputProps={{
// 								startAdornment: selectedItem.map(item => (
// 									<Chip
// 										key={item}
// 										tabIndex={-1}
// 										label={item}
// 										className={classes.chip}
// 										onDelete={handleDelete(item)}
// 									/>
// 								)),
// 								onBlur,
// 								onChange: event => {
// 									handleInputChange(event)
// 									onChange(event)
// 								},
// 								onFocus,
// 							}}
// 							{...other}
// 							{...inputProps}
// 						/>
// 					</div>
// 				)
// 			}}
// 		</Downshift>
// 	)
// }

// export default TagsInputField
export {}
