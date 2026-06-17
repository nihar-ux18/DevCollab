import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import DashboardPage from "../../pages/Dashboard/DashboardPage";
import TasksPage from "../../pages/Tasks/TasksPage";
import NotesPage from "../../pages/Notes/NotesPage";
import LearningPage from "../../pages/Learning/LearningPage";
import FocusPage from "../../pages/Focus/FocusPage";
import GitHubPage from "../../pages/GitHub/GitHubPage";
import SettingsPage from "../../pages/Settings/SettingsPage";
import AnalyticsPage from "../../pages/Analytics/AnalyticsPage";
import AssistantPage from "../../pages/Assistant/AssistantPage";
import LoginPage from "../../pages/Login/LoginPage";
import RegisterPage from "../../pages/Register/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";


export default function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
				<Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
				<Route element={<ProtectedRoute> <DashboardLayout/> </ProtectedRoute>}>
					<Route path="/" element={<DashboardPage />} />
					<Route path="/tasks" element={<TasksPage />} />
					<Route path="/notes" element={<NotesPage />} />
					<Route path="/learning" element={<LearningPage />} />
					<Route path="/focus" element={<FocusPage />} />
					<Route path="/github" element={<GitHubPage />} />
					<Route path="/analytics" element={<AnalyticsPage />} />
					<Route path="/assistant" element={<AssistantPage />} />
					<Route path="/settings" element={<SettingsPage />} /> 
				</Route>
			</Routes>
		</BrowserRouter>
	)
}