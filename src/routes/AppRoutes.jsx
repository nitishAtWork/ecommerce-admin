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
import Keywords from "../pages/keywords/Keywords";
import Orders from "../pages/orders/Orders";
import OrderView from "../pages/orders/OrderView";
import Customers from "../pages/customers/Customers";
import CustomerDetail from "../pages/customers/CustomerDetail";
import CustomerEdit from "../pages/customers/CustomerEdit";
import Reviews from "../pages/reviews/Reviews";
import ReviewDetail from "../pages/reviews/ReviewDetail";

// import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";
import AddKeyword from "../pages/keywords/AddKeyword";
import EditKeyword from "../pages/keywords/EditKeyword";
import KeywordDetails from "../pages/keywords/KeywordDetails";
import SuperProtectedRoute from "./SuperProtectedRoute";
import Countries from "../pages/countries/Countries";
import AddCountry from "../pages/countries/AddCountry";
import EditCountry from "../pages/countries/EditCountry";
import AddState from "../pages/states/AddState";
import EditState from "../pages/states/EditState";
import States from "../pages/states/States";
import Cities from "../pages/cities/Cities";
import AddCity from "../pages/cities/AddCity";
import EditCity from "../pages/cities/EditCity";
import NatureOfBusinesses from "../pages/natureOfBusiness/NatureOfBusinesses";
import NatureOfBusinessForm from "../pages/natureOfBusiness/NatureOfBusinessForm";
import KeywordInCity from "../pages/keywordInCity/KeywordInCity";
import OurPresence from "../pages/ourPresence/OurPresence";
import Enquiries from "../pages/enquiries/Enquiries";
import EnquiryDetails from "../pages/enquiries/EnquiryDetails";

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

                    <Route element={<SuperProtectedRoute />}>
                        {/* /admin/keywords*/}
                        <Route
                            path="keywords"
                            element={<Keywords />}
                        />

                        <Route
                            path="keywords/add"
                            element={<AddKeyword />}
                        />
                        <Route
                            path="keywords/:id/edit"
                            element={<EditKeyword />}
                        />

                        {/* /admin/keywords/:id */}
                        <Route
                            path="keywords/:id"
                            element={<KeywordDetails />}
                        />

                        {/* location */}
                        <Route
                            path="locations/countries"
                            element={<Countries />}
                        />
                        <Route
                            path="locations/countries/add"
                            element={<AddCountry />}
                        />

                        <Route
                            path="locations/countries/:id/edit"
                            element={<EditCountry />}
                        />
                        <Route
                            path="locations/states"
                            element={<States />}
                        />

                        <Route
                            path="locations/states/add"
                            element={<AddState />}
                        />

                        <Route
                            path="locations/states/:id/edit"
                            element={<EditState />}
                        />
                        <Route
                            path="locations/cities"
                            element={<Cities />}
                        />

                        <Route
                            path="locations/cities/add"
                            element={<AddCity />}
                        />

                        <Route
                            path="locations/cities/:id/edit"
                            element={<EditCity />}
                        />

                        <Route
                            path="nature-of-business"
                            element={<NatureOfBusinesses />}
                        />

                        <Route
                            path="nature-of-business/add"
                            element={<NatureOfBusinessForm />}
                        />
                        <Route
                            path="keyword-in-city"
                            element={<KeywordInCity />}
                        />
                        <Route
                            path="our-presence"
                            element={<OurPresence />}
                        />

                        <Route
                            path="nature-of-business/:id/edit"
                            element={<NatureOfBusinessForm />}
                        />

                        {/* Enquiry */}
                        <Route
                            path="/admin/enquiries"
                            element={
                                <Enquiries />
                            }
                        />

                        <Route
                            path="/admin/enquiries/:id"
                            element={
                                <EnquiryDetails />
                            }
                        />
                    </Route>

                    <Route
                        path="orders"
                        element={<Orders />}
                    />

                    <Route
                        path="/admin/orders/:id"
                        element={<OrderView />}
                    />

                    <Route
                        path="customers"
                        element={<Customers />}
                    />

                    <Route
                        path="/admin/customers/:id"
                        element={<CustomerDetail />}
                    />

                    <Route
                        path="/admin/customers/:id/edit"
                        element={<CustomerEdit />}
                    />

                    <Route
                        path="/admin/reviews"
                        element={<Reviews />}
                    />

                    <Route
                        path="/admin/reviews/:id"
                        element={<ReviewDetail />}
                    />

                    {/* Future routes */}

                    {/* 

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
