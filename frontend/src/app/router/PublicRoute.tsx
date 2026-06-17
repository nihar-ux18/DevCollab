import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
	children?: React.ReactNode;
}

export default function PublicRoute({ children,}: PublicRouteProps) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if(isAuthenticated){
		return <Navigate to="/" replace />
	}

	return <>{children}</>
}


