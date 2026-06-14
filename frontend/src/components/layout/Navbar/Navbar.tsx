import { Bell } from "lucide-react";
import { Input } from "../../ui/Input/Input";

export const Navbar = () => {
    return(
        <header className="h-16 border-b border-bs-zinc-800 bg-zinc-900">
            <div className="flex h-full items-center justify-between px-6">
                <div className="w-72">
                    <Input placeholder="Search..." />
                </div>

                <div>
                    <Bell size = {20} />

                    <div className="h-9 w-9 rounded-full bg-blue-500"/>
                </div>
            </div>

        </header>
    );
};