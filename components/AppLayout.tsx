import { ReactNode } from 'react'
import AppFooter from './AppFooter'
import AppHeader from './AppHeader'
import { Container } from '@mui/material'

type LayoutProps = {
	isHome: boolean
	children: ReactNode
}

const AppLayout = ({ isHome, children }: LayoutProps): JSX.Element => (
	<>
		<AppHeader />
		<main id="app-main">{isHome ? children : <Container maxWidth="xl">{children}</Container>}</main>
		<AppFooter />
	</>
)

export default AppLayout
