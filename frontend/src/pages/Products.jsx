import { useState } from "react";
import AddProduct from "../components/products/AddProduct";


function Products(){


    const [showForm,setShowForm] = useState(false);



    const products = [

        {
            id:1,
            name:"Laptop",
            category:"Electronics",
            price:"$1200",
            stock:25
        },

        {
            id:2,
            name:"Keyboard",
            category:"Accessories",
            price:"$50",
            stock:5
        },

        {
            id:3,
            name:"Monitor",
            category:"Electronics",
            price:"$300",
            stock:15
        },

        {
            id:4,
            name:"Mouse",
            category:"Accessories",
            price:"$25",
            stock:2
        }

    ];



    return(


        <div>



            <div className="flex justify-between items-center">


                <div>

                    <h1 className="text-4xl font-bold text-slate-800">
                        Products
                    </h1>


                    <p className="text-gray-500 mt-2">
                        Manage your inventory products.
                    </p>

                </div>



                <button

                    onClick={()=>setShowForm(!showForm)}

                    className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"

                >

                    + Add Product

                </button>



            </div>



            {
                showForm && <AddProduct/>
            }




            <div className="mt-8 bg-white rounded-xl shadow-md p-6">



                <input

                    type="text"

                    placeholder="Search products..."

                    className="border rounded-lg p-3 w-full mb-5"

                />



                <table className="w-full text-left">


                    <thead>


                        <tr className="border-b">


                            <th className="py-3">
                                ID
                            </th>


                            <th>
                                Product
                            </th>


                            <th>
                                Category
                            </th>


                            <th>
                                Price
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


                    {

                        products.map((product)=>(


                            <tr 
                                key={product.id}
                                className="border-b"
                            >


                                <td className="py-3">
                                    {product.id}
                                </td>


                                <td>
                                    {product.name}
                                </td>


                                <td>
                                    {product.category}
                                </td>


                                <td>
                                    {product.price}
                                </td>


                                <td>
                                    {product.stock}
                                </td>


                                <td>


                                {

                                    product.stock <= 5

                                    ?

                                    <span className="text-red-600 font-semibold">
                                        Low Stock
                                    </span>

                                    :

                                    <span className="text-green-600 font-semibold">
                                        Available
                                    </span>

                                }


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


export default Products;