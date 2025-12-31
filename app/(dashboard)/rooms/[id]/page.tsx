/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, X, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import { useParams } from "next/navigation"; // Import the correct hook
import { useGetRoomByIdQuery } from "@/api/baseApi";

// A map to convert the camelCase amenity names from the API to human-readable labels
const amenityLabels: { [key: string]: string } = {
  freeWifi: "Free Wifi",
  shower: "Shower",
  airportTransport: "Airport Transport",
  balcony: "Balcony",
  refrigerator: "Refrigerator",
  support24_7: "24/7 Support",
  workDesk: "Work Desk",
  fitnessCenter: "Fitness Center",
  swimmingPool: "Swimming Pool",
};

// Define types for better safety
interface RoomImage {
  url: string;
  isPrimary: boolean;
}

export default function RoomDetailsPage() {
  // --- THIS IS THE FIX (PART 1) ---
  // Use the hook to get the params object.
  const params = useParams();
  // The hook can return a string or string[]. We handle the simple case.
  const id: any = Array.isArray(params.id) ? params.id[0] : params.id;
  const roomId = parseInt(id, 10);
  const skip = isNaN(roomId);

  const {
    data: room,
    isLoading,
    isError,
    error,
  } = useGetRoomByIdQuery(roomId, { skip });

  // --- LOADING STATE ---
  if (isLoading || skip) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <span className="ml-4 text-gray-500">Loading room details...</span>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (isError || !room) {
    console.error("Error fetching room details:", error);
    return (
      <div className="text-center text-red-500 bg-red-50 p-4 rounded-md">
        Failed to load room details. It may not exist.
        <Link
          href="/rooms"
          className="block mt-4 text-blue-600 hover:underline"
        >
          Return to Rooms List
        </Link>
      </div>
    );
  }

  const primaryImage = room?.images?.find((img: RoomImage) => img.isPrimary);
  const galleryImages = room?.images?.filter(
    (img: RoomImage) => !img.isPrimary
  );
  const amenities = Object.keys(amenityLabels).reduce((acc, key) => {
    if (typeof room[key] === "boolean") {
      (acc as any)[key] = room[key];
    }
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          {room.name} - Details
        </h1>
        {/* Use the `id` from the hook here */}
        <Link
          href={`/rooms/${id}/edit`}
          className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700"
        >
          Edit Room
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Image Gallery
            </h2>
            {primaryImage ? (
              <Image
                src={primaryImage.url.replace(
                  "/upload/",
                  "/upload/f_auto,q_auto/"
                )}
                alt="Primary room image"
                width={1200}
                height={800}
                priority
                className="w-full h-auto rounded-lg mb-4 object-cover"
              />
            ) : (
              <p className="text-gray-500">No primary image available.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {galleryImages?.map((image: any, index: any) => (
                <Image
                  key={index}
                  src={image.url}
                  alt={`Gallery image ${index + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-lg object-cover"
                />
              ))}
            </div>
            {galleryImages?.length === 0 && !primaryImage && (
              <p className="text-gray-500 text-sm">
                No images have been uploaded for this room.
              </p>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Room Details
            </h2>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong>Price:</strong> ${room.price.toFixed(2)} / night
              </p>
              <p>
                <strong>Size:</strong> {room.size} sqm
              </p>
              <p>
                <strong>Capacity:</strong> {room.capacity} Guests
              </p>
              <p className="pt-2">
                <strong>Description:</strong> {room.description}
              </p>
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-bold text-gray-700 mb-4">Amenities</h2>
            <ul className="space-y-2">
              {Object.entries(amenities).map(([key, value]) => (
                <li key={key} className="flex items-center">
                  {value ? (
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <X className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span
                    className={
                      value ? "text-gray-800" : "text-gray-500 line-through"
                    }
                  >
                    {amenityLabels[key]}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-xl font-bold text-gray-700 mb-4">Features</h2>
            <div className="flex flex-wrap gap-2">
              {room.features &&
                room.features.map((feature: string) => (
                  <span
                    key={feature}
                    className="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
