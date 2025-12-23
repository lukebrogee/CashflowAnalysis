import { Navigate, Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import { useAuth } from "../../Auth/AuthContext";

export default function ProtectedLayout() {
  const { user, logout } = useAuth();

  if (!user){
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace/>;
    }

  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}