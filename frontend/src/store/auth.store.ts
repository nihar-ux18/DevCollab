import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, User } from "../types/auth.types";


// TODO: Implement auth store
export const useAuthStore = create<AuthState> () (
	persist(
		(set)=>({
			user : null,
			isAuthenticated : false,

			login: (user: User)=>set({
				user,
				isAuthenticated: true,
			}),

			logout: () => set({
				user :null,
				isAuthenticated :  false,
			}),
		}),
		{
			name : "devflow-auth",
		}
	)
);
