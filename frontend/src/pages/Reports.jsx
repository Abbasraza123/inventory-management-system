function Reports(){

    const reportData = [

        {
            title:"Total Sales",
            value:"$45,800",
            color:"text-green-600"
        },

        {
            title:"Total Products",
            value:"124",
            color:"text-blue-600"
        },

        {
            title:"Low Stock Items",
            value:"8",
            color:"text-red-600"
        },

        {
            title:"Suppliers",
            value:"15",
            color:"text-purple-600"
        }

    ];


    return(

        <div>


            <h1 className="text-4xl font-bold text-slate-800">
                Reports
            </h1>


            <p className="text-gray-500 mt-2">
                Analyze your inventory performance.
            </p>




            <div className="grid grid-cols-4 gap-6 mt-8">


            {
                reportData.map((report,index)=>(


                    <div 
                        key={index}
                        className="bg-white rounded-xl shadow-md p-6"
                    >


                        <p className="text-gray-500">
                            {report.title}
                        </p>


                        <h2 className={`text-3xl font-bold mt-3 ${report.color}`}>

                            {report.value}

                        </h2>


                    </div>


                ))
            }


            </div>





            <div className="mt-10 bg-white rounded-xl shadow-md p-6">


                <h2 className="text-2xl font-bold text-slate-800 mb-5">
                    Inventory Summary
                </h2>



                <div className="space-y-5">



                    <div>

                        <div className="flex justify-between mb-2">

                            <span>
                                Electronics
                            </span>

                            <span>
                                80%
                            </span>

                        </div>


                        <div className="w-full bg-gray-200 rounded-full h-3">


                            <div 
                                className="bg-blue-600 h-3 rounded-full"
                                style={{width:"80%"}}
                            >

                            </div>


                        </div>


                    </div>





                    <div>

                        <div className="flex justify-between mb-2">

                            <span>
                                Accessories
                            </span>

                            <span>
                                60%
                            </span>

                        </div>


                        <div className="w-full bg-gray-200 rounded-full h-3">


                            <div 
                                className="bg-green-600 h-3 rounded-full"
                                style={{width:"60%"}}
                            >

                            </div>


                        </div>


                    </div>





                    <div>

                        <div className="flex justify-between mb-2">

                            <span>
                                Furniture
                            </span>

                            <span>
                                40%
                            </span>

                        </div>


                        <div className="w-full bg-gray-200 rounded-full h-3">


                            <div 
                                className="bg-purple-600 h-3 rounded-full"
                                style={{width:"40%"}}
                            >

                            </div>


                        </div>


                    </div>



                </div>



            </div>



        </div>


    );

}


export default Reports;