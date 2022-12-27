import type { NextPage } from 'next'
import Head from 'next/head'

import About from '../components/About'
import Banner from '../components/Banner'
import Faq from '../components/Faq'
import Features from '../components/Features'
import RecentProjectActivity from '../components/RecentProjectActivity'
import { get } from '../utils/http'

type Project = {
	_id: string
	name: string
	description: string
	stems: string[]
	trackLimit: number
	collaborators: string[]
	tags: string[]
}

type HomeProps = {
	projects: Project[]
}

const Home: NextPage<HomeProps> = ({ projects }) => {
	return (
		<>
			<Head>
				<title>Arbor | A Generative Music NFT Platform</title>
			</Head>
			<Banner />
			<Features />
			<About />
			<Faq />
			<RecentProjectActivity projects={projects} />
		</>
	)
}

export const getServerSideProps = async () => {
	const result = await get('/projects/recent')
	return {
		props: {
			projects: result.data,
		},
	}
}

export default Home
