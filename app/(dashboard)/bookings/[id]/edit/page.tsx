import Card from "@/components/ui/Card";
import Link from "next/link";

const mockBookingDetails = {
  id: 1,
  bookingId: "clx123abc",
  guestInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
  },
  roomInfo: { name: "The Sunrise Suite" },
  bookingDates: { checkIn: "2025-11-20", checkOut: "2025-11-25" },
  guestCount: { adults: 2, children: 1 },
};

export default async function EditBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const { guestInfo, bookingDates, guestCount, roomInfo } = mockBookingDetails;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800">Edit Booking</h1>
      <p className="text-gray-600 mt-1">
        Booking ID: {mockBookingDetails.bookingId} for {roomInfo.name}
      </p>

      <Card className="mt-8">
        <form className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800 border-b pb-2">
              Guest Information
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={guestInfo.name}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={guestInfo.email}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue={guestInfo.phone}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-800 border-b pb-2">
              Booking Details
            </h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Check-in Date
                </label>
                <input
                  type="date"
                  defaultValue={bookingDates.checkIn}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Check-out Date
                </label>
                <input
                  type="date"
                  defaultValue={bookingDates.checkOut}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Adults
                </label>
                <input
                  type="number"
                  defaultValue={guestCount.adults}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Children
                </label>
                <input
                  type="number"
                  defaultValue={guestCount.children}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href={`/bookings/${params.id}`}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
