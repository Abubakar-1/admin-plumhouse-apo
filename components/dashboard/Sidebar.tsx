// app/components/dashboard/Sidebar.tsx
import Link from "next/link";
import { Home, BedDouble, CalendarCheck } from "lucide-react"; // `npm install lucide-react`

const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
        Guesthouse
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Overview</span>
        </Link>
        <Link
          href="/rooms"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <BedDouble className="w-5 h-5" />
          <span>Rooms</span>
        </Link>
        <Link
          href="/bookings"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Bookings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
