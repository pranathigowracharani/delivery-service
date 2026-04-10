import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import FaceLogin from "./FaceLogin";
import FaceRegister from "./FaceRegister";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ActiveOrders from "./pages/ActiveOrders";
import OrderHistory from "./pages/OrderHistory";
import Earnings from "./pages/Earnings";
import Coupons from "./pages/Coupons";
import Profile from "./pages/Profile";

function AppLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/active-orders" element={<ActiveOrders />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<FaceLogin />} />
        <Route path="/register" element={<FaceRegister />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
