


import Sidebar from "@/components/Admin/Sidebar";
import Navbar from "@/components/Admin/Nav";

export default function AdminLayout({ children }) {

  return (
    <>
    
    <div className="flex gap-4  mx-auto w-[95%]">
    <Sidebar/>

  <div className="flex flex-col w-full">
  <Navbar/>

  {children}
  </div>
   

    </div>
    
    
    </>
  );
}
