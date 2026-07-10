function Categories(){

    const categories = [
        {
            id:1,
            name:"Electronics",
            products:45
        },
        {
            id:2,
            name:"Accessories",
            products:30
        },
        {
            id:3,
            name:"Furniture",
            products:20
        },
        {
            id:4,
            name:"Stationery",
            products:15
        }
    ];


    return(

        <div>


            <div className="flex justify-between items-center">


                <div>

                    <h1 className="text-4xl font-bold text-slate-800">
                        Categories
                    </h1>


                    <p className="text-gray-500 mt-2">
                        Manage product categories.
                    </p>

                </div>


                <button className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700">

                    + Add Category

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
                                Category Name
                            </th>

                            <th>
                                Total Products
                            </th>


                        </tr>

                    </thead>



                    <tbody>


                    {
                        categories.map((category)=>(

                            <tr 
                                key={category.id}
                                className="border-b"
                            >

                                <td className="py-3">
                                    {category.id}
                                </td>


                                <td>
                                    {category.name}
                                </td>


                                <td>
                                    {category.products}
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


export default Categories;