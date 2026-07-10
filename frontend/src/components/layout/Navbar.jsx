import { Search, Bell, UserCircle2 } from "lucide-react";

function Navbar() {

    return (

        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8">

            <h2 className="text-3xl font-bold">
                Dashboard
            </h2>

            <div className="flex items-center gap-6">

                <Search className="cursor-pointer"/>

                <Bell className="cursor-pointer"/>

                <UserCircle2 size={34}/>

            </div>

        </header>

    );

}

export default Navbar;