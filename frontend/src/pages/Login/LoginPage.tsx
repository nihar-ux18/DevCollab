import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button/Button";
import { Input } from "../../components/ui/Input/Input";
import { Card } from "../../components/ui/Card/Card";
import { useAuthStore } from "../../store/auth.store";

export default function LoginPage() {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = () => {
		if (
			email === "demo@devflow.com" &&
			password === "123456"
		) {
			login({
				id: "1",
				name: "Demo User",
				email,
			});

			navigate("/");
		} else {
			alert("Invalid credentials");
		}
	};

	return (
		<div className="flex min-h-screen item-center justify-center">
			<Card className="w-full max-w-md p-6">
				<h1 className="mb-6 text-2xl font-bold">Login</h1>

				<div className="space-y-4">
					<Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
					<Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
					<Button className="w-full" onClick={handleLogin} >Login</Button>
					<Button variant="outline" className="w-full" >Login with Google</Button>
					<Button variant="outline" className="w-full" >Login with GitHub</Button>
					<p className="text-center text-sm">Don't have an account?{" "}
						<Link to="/register" className="text-blue-500">Register</Link>
					</p>
				</div>
			</Card>
		</div>
	);
}