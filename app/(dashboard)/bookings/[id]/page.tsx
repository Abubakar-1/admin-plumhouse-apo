// app/(dashboard)/bookings/[id]/page.tsx
import Link from "next/link";
import {
  User,
  BedDouble,
  Calendar,
  Users,
  Hash,
  DollarSign,
} from "lucide-react";
import Card from "@/components/ui/Card";

const mockBookingDetails = {
  id: 1,
  bookingId: "clx123abc",
  guestInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
  },
  roomInfo: { id: 101, name: "The Sunrise Suite", price: 150.5 },
  bookingDates: {
    checkIn: "2025-11-20T14:00:00Z",
    checkOut: "2025-11-25T11:00:00Z",
    createdAt: "2025-10-01T10:30:00Z",
  },
  guestCount: { adults: 2, children: 1 },
  totalPrice: 752.5,
  status: "Confirmed",
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-start py-3 border-b">
    <Icon className="w-5 h-5 text-gray-500 mr-4 mt-1" />
    <div className="flex-1">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export default async function BookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    guestInfo,
    roomInfo,
    bookingDates,
    guestCount,
    totalPrice,
    status,
    bookingId,
  } = mockBookingDetails;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          Booking Details
        </h1>
        <div>
          <Link
            href={`/bookings/${params.id}/edit`}
            className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Edit Booking
          </Link>
          <button className="ml-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
            Cancel Booking
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <DetailRow icon={Hash} label="Booking ID" value={bookingId} />
            <DetailRow
              icon={Calendar}
              label="Check-in"
              value={new Date(bookingDates.checkIn).toLocaleString()}
            />
            <DetailRow
              icon={Calendar}
              label="Check-out"
              value={new Date(bookingDates.checkOut).toLocaleString()}
            />
            <DetailRow
              icon={BedDouble}
              label="Room"
              value={`${roomInfo.name} (#${roomInfo.id})`}
            />
            <DetailRow
              icon={Users}
              label="Guests"
              value={`${guestCount.adults} Adult(s), ${guestCount.children} Child(ren)`}
            />
            <DetailRow
              icon={DollarSign}
              label="Total Price"
              value={`$${totalPrice.toFixed(2)}`}
            />
          </Card>
        </div>
        <div>
          <Card>
            <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
              Guest Information
            </h2>
            <DetailRow icon={User} label="Name" value={guestInfo.name} />
            <div className="py-3 border-b">
              <p className="text-sm text-gray-600">Email</p>
              <a
                href={`mailto:${guestInfo.email}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {guestInfo.email}
              </a>
            </div>
            <div className="py-3">
              <p className="text-sm text-gray-600">Phone</p>
              <a
                href={`tel:${guestInfo.phone}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {guestInfo.phone}
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
