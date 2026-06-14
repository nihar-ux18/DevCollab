import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar/Navbar';
import { Sidebar } from '../../components/layout/Sidebar/Sidebar';

export default function DashboardLayout() {
	return (
		<div className="flex min-h-screen">
			<aside className="w-64 border-r border-zinc-800">
				<Sidebar />
			</aside>

			<div className="flex flex-1 flex-col">
				<Navbar />

				<main className="flex-1">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
