// app/(dashboard)/page.tsx
import Card from "../components/ui/Card";

export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800">
        Dashboard Overview
      </h1>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-600">Total Bookings</h3>
          <p className="mt-2 text-4xl font-bold text-gray-800">128</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-600">Total Rooms</h3>
          <p className="mt-2 text-4xl font-bold text-gray-800">5</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-600">
            Upcoming Check-ins
          </h3>
          <p className="mt-2 text-4xl font-bold text-gray-800">3</p>
        </Card>
      </div>
    </div>
  );
}
