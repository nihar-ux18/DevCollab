import { NavLink } from "react-router-dom";
import { navigation } from "../../../config/navigation";

export const Sidebar = () => {
    return(
        <aside className="w-64 border-r border-bs-zinc-800 bg-zinc-950">
            <div className="p-6">
                <h1 className="text-xl font-bold">DevFlow</h1>
            </div>

            <nav className="space-y-2 px-3">
                {navigation.map((item)=>{
                    const Icon = item.icon;

                    return(
                        <NavLink key={item.path} to={item.path} className={({ isActive })=>`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                            isActive ? "bg-blue-500 text-white" : "text-zinc-400 hover:bg-zinc-900"
                        }`}>
                            <Icon size = {18} />
                            {item.label}
                        </NavLink>
                    )
                })}

            </nav>
        </aside>
    );
};