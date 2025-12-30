/*
------------------------------------------------------------------
FILE NAME:     PublicLayout.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Wraps public pages only accessed for users without authentication
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Updated authentication checkpoint, if authorized return to /dashboard
------------------------------------------------------------------
*/
import { Navigate, Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import { useAuth } from "../../Auth/AuthContext";


export default function PublicLayout() {

  const { authorized, loading } = useAuth();


  if (loading){
    return null;
  }
  if (authorized){
    return <Navigate to="/dashboard" replace />;
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