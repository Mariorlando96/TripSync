import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    const token = localStorage.getItem("token"); // Check if user is logged in

    return token ? <Outlet /> : <Navigate to="/login" />;
};

