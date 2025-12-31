"use client";

import { useGetBookingsQuery } from "@/api/baseApi";
import Card from "@/components/ui/Card";
import Link from "next/link";

const statusColors: { [key: string]: string } = {
  Confirmed: "bg-blue-100 text-blue-800",
  "Checked-in": "bg-green-100 text-green-800",
  Completed: "bg-gray-100 text-gray-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function BookingsPage() {
  const {
    data: bookingsResponse,
    isLoading,
    isError,
    error,
  } = useGetBookingsQuery();
  // const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  // const handleDelete = async (id: number) => {
  //   if (confirm("Are you sure you want to delete this room?")) {
  //     try {
  //       await deleteRoom(id).unwrap();
  //     } catch (err) {
  //       console.error("Failed to delete the room: ", err);
  //       alert("Failed to delete room.");
  //     }
  //   }
  // };

  // --- LOADING STATE ---
  if (isLoading) {
    return <div>Loading rooms...</div>;
  }

  // --- ERROR STATE ---
  if (isError) {
    console.error("Error fetching bookings: ", error);
    return (
      <div className="text-center text-red-500 bg-red-50 p-4 rounded-md">
        Failed to load rooms. Please try again later.
      </div>
    );
  }

  // --- THIS IS THE FIX ---
  // Because of `transformResponse` in the API slice, `roomsResponse` IS the array.
  // We no longer need to access a `.data` property on it.
  const bookings = bookingsResponse || [];
  console.log("bookings", bookings);
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          Manage Bookings
        </h1>
        {/* No "Create Booking" button for admin, as bookings come from guests */}
      </div>
      <Card className="mt-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 font-medium text-gray-600">Guest</th>
              <th className="px-6 py-3 font-medium text-gray-600">Room</th>
              <th className="px-6 py-3 font-medium text-gray-600">Dates</th>
              <th className="px-6 py-3 font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium">{booking.guestName}</div>
                  <div className="text-sm text-gray-500">
                    ID: {booking.bookingId}
                  </div>
                </td>
                <td className="px-6 py-4">{booking.room.name}</td>
                <td className="px-6 py-4">
                  {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                  {new Date(booking.checkOut).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[booking.status]
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
