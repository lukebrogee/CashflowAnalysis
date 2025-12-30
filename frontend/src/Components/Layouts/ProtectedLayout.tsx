/*
------------------------------------------------------------------
FILE NAME:     ProtectedLayout.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Wraps protected pages only accessed for users with authentication
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Updated authentication checkpoint, if not authorized return to /login
------------------------------------------------------------------
*/
import { Navigate, Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import { useAuth } from "../../Auth/AuthContext";

export default function ProtectedLayout() {
  const { authorized, loading } = useAuth();


  if (loading){
    return null;
  }
  if (!authorized){
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
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