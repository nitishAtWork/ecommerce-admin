import { Navigate, Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";

import NotFound from "../pages/NotFound";
import Dashboard from "../pages/dashboard/Dashboard";
import Products from "../pages/products/Products";
import AddProduct from "../pages/products/AddProduct";
import EditProduct from "../pages/products/EditProduct";
import ProductDetails from "../pages/products/ProductDetails";

// import Orders from "../pages/orders/Orders";
// import Customers from "../pages/customers/Customers";
// import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";

function AppRoutes() {
    return (
        <Routes>
            {/* Base URL → Admin */}
            <Route
                path="/"
                element={
                    <Navigate
                        to="/admin"
                        replace
                    />
                }
            />

            {/* Authentication */}
            <Route
                path="/admin/login"
                element={<Login />}
            />

            {/* Redirect old login URL */}
            <Route
                path="/login"
                element={
                    <Navigate
                        to="/admin/login"
                        replace
                    />
                }
            />

            {/* Protected Admin */}
            <Route element={<ProtectedRoute />}>
                <Route
                    path="/admin"
                    element={<AdminLayout />}
                >
                    {/* /admin */}
                    <Route
                        index
                        element={<Dashboard />}
                    />

                    {/* /admin/products */}
                    <Route
                        path="products"
                        element={<Products />}
                    />

                    {/* /admin/products/add */}
                    <Route
                        path="products/add"
                        element={<AddProduct />}
                    />

                    {/* /admin/products/:id/edit */}
                    <Route
                        path="products/:id/edit"
                        element={<EditProduct />}
                    />

                    {/* /admin/products/:id */}
                    <Route
                        path="products/:id"
                        element={<ProductDetails />}
                    />

                    {/* Future routes */}

                    {/* 
                    <Route
                        path="orders"
                        element={<Orders />}
                    />

                    <Route
                        path="customers"
                        element={<Customers />}
                    />

                    <Route
                        path="reports"
                        element={<Reports />}
                    />

                  
                    */}
                      <Route
                        path="settings"
                        element={<Settings />}
                    />
                </Route>
            </Route>

            {/* Anything else → 404 */}
            <Route
                path="*"
                element={<NotFound />}
            />
        </Routes>
    );
}

export default AppRoutes;
