import type { ReactNode } from 'react'
import AppFooter from './AppFooter'
import AppHeader from './AppHeader'
import { Container } from '@mui/material'

type LayoutProps = {
	children: ReactNode
}

const AppLayout = ({ children }: LayoutProps): JSX.Element => (
	<>
		<AppHeader />
		<main id="app-main">
			<Container maxWidth="xl">{children}</Container>
		</main>
		<AppFooter />
	</>
)

export default AppLayout
