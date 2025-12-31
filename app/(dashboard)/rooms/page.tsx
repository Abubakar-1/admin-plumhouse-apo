"use client";

import Card from "@/components/ui/Card";
import { BedDouble, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useDeleteRoomMutation, useGetRoomsQuery } from "@/api/baseApi";

// Define types for our data for better type safety and autocompletion
interface RoomImage {
  id: number;
  url: string;
  publicId: string;
  isPrimary: boolean;
  roomId: number;
}

interface Room {
  id: number;
  name: string;
  price: number;
  capacity: number;
  images: RoomImage[];
}

export default function RoomsPage() {
  const { data: roomsResponse, isLoading, isError, error } = useGetRoomsQuery();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this room?")) {
      try {
        await deleteRoom(id).unwrap();
      } catch (err) {
        console.error("Failed to delete the room: ", err);
        alert("Failed to delete room.");
      }
    }
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return <div>Loading rooms...</div>;
  }

  // --- ERROR STATE ---
  if (isError) {
    console.error("Error fetching rooms: ", error);
    return (
      <div className="text-center text-red-500 bg-red-50 p-4 rounded-md">
        Failed to load rooms. Please try again later.
      </div>
    );
  }

  // --- THIS IS THE FIX ---
  // Because of `transformResponse` in the API slice, `roomsResponse` IS the array.
  // We no longer need to access a `.data` property on it.
  const rooms: Room[] = roomsResponse || [];

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Manage Rooms</h1>
        <Link
          href="/rooms/create"
          className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center gap-2"
        >
          <BedDouble className="w-4 h-4" />
          <span>Create Room</span>
        </Link>
      </div>

      <Card className="mt-8">
        {rooms.length > 0 ? (
          <table className="w-full text-left align-middle">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 font-medium text-gray-600">Name</th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Price/Night
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">
                  Capacity
                </th>
                <th className="px-6 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                // Find the primary image for display in the table
                return (
                  <tr key={room.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {room.name}
                    </td>
                    <td className="px-6 py-4">${room.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{room.capacity} Guests</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/rooms/${room.id}`}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/rooms/${room.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(room.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <BedDouble className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No rooms available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new room.
            </p>
            <div className="mt-6">
              <Link
                href="/rooms/create"
                className="inline-flex items-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700"
              >
                + Add New Room
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
