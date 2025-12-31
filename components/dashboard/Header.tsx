// app/components/dashboard/Header.tsx
const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Welcome Admin!</h1>
      </div>
      <div>
        {/* Placeholder for user menu, notifications, etc. */}
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
