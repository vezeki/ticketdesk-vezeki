import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./routes/PrivateRoute.jsx";
import { AppLayout } from "./components/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TicketList from "./pages/Tickets/TicketList.jsx";
import TicketNew from "./pages/Tickets/TicketNew.jsx";
import TicketDetail from "./pages/Tickets/TicketDetail.jsx";
import Users from "./pages/Admin/Users.jsx";
import TiBoard from "./pages/Ti/TiBoard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<TicketList />} />
        <Route path="/tickets/new" element={<TicketNew />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route
          path="/ti/quadro"
          element={
            <PrivateRoute roles={["ADMIN", "TECNICO"]}>
              <TiBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute roles={["ADMIN"]}>
              <Users />
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
