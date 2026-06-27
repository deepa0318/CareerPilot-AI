import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}