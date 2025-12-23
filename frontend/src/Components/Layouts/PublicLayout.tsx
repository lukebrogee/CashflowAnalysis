import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";

export default function PublicLayout() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
      
    </>
  );
}