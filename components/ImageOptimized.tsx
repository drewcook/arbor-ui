import { Box } from '@mui/material'
import Image from 'next/image'
import { Blob } from 'nft.storage'
import PropTypes from 'prop-types'

type ImageOptimizedProps = {
	src: string | StaticImageData
	alt?: string
	title?: string
	width?: number
	height?: number
}

const ImageOptimized = (props: ImageOptimizedProps): JSX.Element => {
	const { src, alt, title, width, height } = props

	return (
		<Box sx={{ backgroundColor: '#555' }}>
			<Image
				src={src}
				alt={alt}
				title={title}
				width={width}
				height={height}
				quality={100}
				loading="eager"
				objectFit="cover"
				objectPosition="center"
				placeholder="blur"
				blurDataURL={new Blob([src.toString()], {
					type: 'image/*',
				}).toString()}
			/>
		</Box>
	)
}

ImageOptimized.propTypes = {
	src: PropTypes.string.isRequired,
	alt: PropTypes.string,
	width: PropTypes.number,
	height: PropTypes.number,
}

ImageOptimized.defaultProps = {
	alt: 'PolyEcho Image',
	title: 'PolyEcho Image',
	width: 200,
	height: 200,
}

export default ImageOptimized
