import { useAuthStore } from "../../../store/auth.store"

const DashboardHeader = () => {
	const user = useAuthStore((state)=> state.user);

	const getGreeting = () => {
		const hour = new Date().getHours();

		if(hour < 12) return "Good Morning";
		if(hour < 18) return "Good Afternoon";
		return "Good Evening";
	};

	return(
		<div>
			<h1 className="text-3xl font-bold">{getGreeting()},{user?.name}</h1>
			<p className="mt-2 text-muted-foreground">Welcome to DevFlow</p>
		</div>
	)
};

export default DashboardHeader;