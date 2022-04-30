import type { ReactNode } from 'react'
import AppFooter from './AppFooter'
import AppHeader from './AppHeader'

type LayoutProps = {
	children: ReactNode,
}

const styles = {}

const AppLayout = ({ children }: LayoutProps): JSX.Element => (
	<>
		<AppHeader />
		<main id="app-main">
			{children}
		</main>
		<AppFooter />
	</>
)

export default AppLayout
