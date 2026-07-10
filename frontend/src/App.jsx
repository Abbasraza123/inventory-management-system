import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";


function App(){


  return(

    <BrowserRouter>


      <Layout>


        <Routes>


          <Route path="/" element={<Dashboard />} />


          <Route path="/dashboard" element={<Dashboard />} />


          <Route path="/products" element={<Products />} />


          <Route path="/categories" element={<Categories />} />


          <Route path="/suppliers" element={<Suppliers />} />


          <Route path="/reports" element={<Reports />} />


        </Routes>


      </Layout>


    </BrowserRouter>


  );


}


export default App;