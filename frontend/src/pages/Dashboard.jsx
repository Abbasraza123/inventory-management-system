import StatCard from "../components/dashboard/StatCard";

function Dashboard() {

    return (

        <div>

            <h1 className="text-4xl font-bold text-slate-800">
                Inventory Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
                Welcome to your inventory management system.
            </p>


            {/* Statistics Cards */}

            <div className="grid grid-cols-4 gap-6 mt-8">

                <StatCard
                    title="Total Products"
                    value="124"
                    color="text-blue-600"
                />

                <StatCard
                    title="Inventory Value"
                    value="$18,450"
                    color="text-green-600"
                />

                <StatCard
                    title="Low Stock"
                    value="8"
                    color="text-red-600"
                />

                <StatCard
                    title="Categories"
                    value="12"
                    color="text-purple-600"
                />

            </div>


            {/* Recent Products */}

            <div className="mt-10 bg-white rounded-xl shadow-md p-6">

                <h2 className="text-2xl font-bold text-slate-800 mb-5">
                    Recent Products
                </h2>


                <table className="w-full text-left">

                    <thead>

                        <tr className="border-b">

                            <th className="py-3">
                                Product
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Stock
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <tr className="border-b">

                            <td className="py-3">
                                Laptop
                            </td>

                            <td>
                                Electronics
                            </td>

                            <td>
                                25
                            </td>

                            <td className="text-green-600">
                                Available
                            </td>

                        </tr>


                        <tr className="border-b">

                            <td className="py-3">
                                Keyboard
                            </td>

                            <td>
                                Accessories
                            </td>

                            <td>
                                5
                            </td>

                            <td className="text-red-600">
                                Low Stock
                            </td>

                        </tr>


                        <tr>

                            <td className="py-3">
                                Monitor
                            </td>

                            <td>
                                Electronics
                            </td>

                            <td>
                                15
                            </td>

                            <td className="text-green-600">
                                Available
                            </td>

                        </tr>


                    </tbody>


                </table>


            </div>


        </div>

    );

}

export default Dashboard;