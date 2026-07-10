import { NavLink } from "react-router-dom";


function Sidebar(){

    const links = [
        {
            name:"Dashboard",
            path:"/dashboard"
        },
        {
            name:"Products",
            path:"/products"
        },
        {
            name:"Categories",
            path:"/categories"
        },
        {
            name:"Suppliers",
            path:"/suppliers"
        },
        {
            name:"Reports",
            path:"/reports"
        }
    ];


    return(

        <div className="w-64 bg-slate-800 min-h-screen text-white p-6">


            <h1 className="text-2xl font-bold mb-8">
                Inventory
            </h1>



            <ul className="space-y-3">


                {
                    links.map((link)=>(

                        <li key={link.path}>


                            <NavLink

                                to={link.path}

                                className={({isActive}) =>
                                    `block p-3 rounded-lg transition ${
                                        isActive
                                        ? "bg-blue-600"
                                        : "hover:bg-slate-700"
                                    }`
                                }

                            >

                                {link.name}

                            </NavLink>


                        </li>


                    ))
                }


            </ul>



        </div>

    );

}


export default Sidebar;