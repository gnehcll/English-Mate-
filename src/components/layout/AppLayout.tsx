import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      <main className="md:ml-16 lg:ml-56 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
