import Link from 'next/link'
import styles from '../styles/Header.module.css'

const Header = (): JSX.Element => {
	return (
		<header className={styles.header}>
			<nav className={styles.nav}>
				<ul>
					<li>
						<Link href="/">
							<a>Home</a>
						</Link>
					</li>
					<li>
						<Link href="/projects">
							<a>Explore</a>
						</Link>
					</li>
					<li>
						<Link href="/projects/new">
							<a>Create</a>
						</Link>
					</li>
				</ul>
			</nav>
		</header>
	)
}

export default Header
