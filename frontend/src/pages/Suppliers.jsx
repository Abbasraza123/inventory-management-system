function Suppliers(){

    const suppliers = [

        {
            id:1,
            name:"Tech Solutions Ltd",
            contact:"0300-1234567",
            email:"tech@gmail.com",
            products:20
        },

        {
            id:2,
            name:"ABC Electronics",
            contact:"0312-9876543",
            email:"abc@gmail.com",
            products:35
        },

        {
            id:3,
            name:"Global Traders",
            contact:"0333-5556677",
            email:"global@gmail.com",
            products:15
        }

    ];


    return(

        <div>


            <div className="flex justify-between items-center">


                <div>

                    <h1 className="text-4xl font-bold text-slate-800">
                        Suppliers
                    </h1>


                    <p className="text-gray-500 mt-2">
                        Manage your product suppliers.
                    </p>

                </div>



                <button className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">

                    + Add Supplier

                </button>


            </div>




            <div className="mt-8 bg-white rounded-xl shadow-md p-6">


                <table className="w-full text-left">


                    <thead>


                        <tr className="border-b">


                            <th className="py-3">
                                ID
                            </th>


                            <th>
                                Supplier Name
                            </th>


                            <th>
                                Contact
                            </th>


                            <th>
                                Email
                            </th>


                            <th>
                                Products Supplied
                            </th>


                        </tr>


                    </thead>




                    <tbody>


                    {
                        suppliers.map((supplier)=>(

                            <tr 
                                key={supplier.id}
                                className="border-b"
                            >


                                <td className="py-3">
                                    {supplier.id}
                                </td>


                                <td>
                                    {supplier.name}
                                </td>


                                <td>
                                    {supplier.contact}
                                </td>


                                <td>
                                    {supplier.email}
                                </td>


                                <td>
                                    {supplier.products}
                                </td>


                            </tr>


                        ))
                    }


                    </tbody>



                </table>


            </div>



        </div>


    );

}


export default Suppliers;