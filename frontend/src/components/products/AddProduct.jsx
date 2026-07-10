function AddProduct(){

    return(

        <div className="bg-white rounded-xl shadow-md p-6 mt-8">

            <h2 className="text-2xl font-bold text-slate-800 mb-5">
                Add New Product
            </h2>


            <div className="grid grid-cols-2 gap-5">


                <input
                    type="text"
                    placeholder="Product Name"
                    className="border p-3 rounded-lg"
                />


                <input
                    type="text"
                    placeholder="Category"
                    className="border p-3 rounded-lg"
                />


                <input
                    type="number"
                    placeholder="Price"
                    className="border p-3 rounded-lg"
                />


                <input
                    type="number"
                    placeholder="Stock"
                    className="border p-3 rounded-lg"
                />


            </div>


            <button className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg">

                Save Product

            </button>


        </div>

    );

}


export default AddProduct;