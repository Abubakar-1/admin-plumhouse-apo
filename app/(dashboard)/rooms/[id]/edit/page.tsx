/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Link from "next/link";
import Image from "next/image";

import { Loader2 } from "lucide-react";
import {
  useGetRoomByIdQuery,
  useLazyGetUploadSignatureQuery,
  useUpdateRoomMutation,
} from "@/api/baseApi";

const amenitiesMap: { [key: string]: string } = {
  "Free Wifi": "freeWifi",
  Shower: "shower",
  "Airport Transport": "airportTransport",
  Balcony: "balcony",
  Refrigerator: "refrigerator",
  "24/7 Support": "support24_7",
  "Work Desk": "workDesk",
  "Fitness Center": "fitnessCenter",
  "Swimming Pool": "swimmingPool",
};

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const roomId = parseInt(id, 10);
  const skip = isNaN(roomId);

  const {
    data: room,
    isLoading: isLoadingRoom,
    isError,
  } = useGetRoomByIdQuery(roomId, { skip });
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const [triggerGetSignature, { isLoading: isGettingSignature }] =
    useLazyGetUploadSignatureQuery();

  const [formData, setFormData] = useState<any>({});
  const [newFiles, setNewFiles] = useState<File[]>([]); // State for newly selected files
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (room) {
      setFormData({
        ...room,
        features: room.features.join(", "),
      });
    }
  }, [room]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    let finalImages = formData.images || [];

    try {
      // If new files were selected, they replace all old images.
      if (newFiles.length > 0) {
        setIsUploading(true);
        const sigResult = await triggerGetSignature();
        if (sigResult?.isError || !sigResult?.data) {
          throw new Error("Could not get upload signature.");
        }

        const uploadPromises = newFiles.map((file) => {
          const cloudinaryFormData = new FormData();
          cloudinaryFormData.append("file", file);
          cloudinaryFormData.append(
            "api_key",
            process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!
          );
          cloudinaryFormData.append(
            "timestamp",
            sigResult?.data?.timestamp.toString()
          );
          cloudinaryFormData.append("signature", sigResult?.data?.signature);
          cloudinaryFormData.append("folder", "guesthouse-rooms");
          return fetch(
            `https://api.cloudinary.com/v1_1/${process.env
              .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`,
            { method: "POST", body: cloudinaryFormData }
          ).then((res) => res.json());
        });

        const uploadResults = await Promise.all(uploadPromises);
        finalImages = uploadResults.map((result, index) => ({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: index === 0,
        }));
        setIsUploading(false);
      }

      const payload = {
        ...formData,
        features: formData.features
          .split(",")
          .map((f: string) => f.trim())
          .filter(Boolean),
        images: finalImages, // Send the final set of images
      };

      await updateRoom({ id: roomId, formData: payload }).unwrap();
      alert("Room updated successfully!");
      router.push(`/rooms/${roomId}`);
    } catch (err: any) {
      setIsUploading(false);
      const message =
        err.data?.message || err.message || "Update failed. Please try again.";
      setErrorMessage(message);
      console.error("Failed to update room:", err);
    }
  };

  const totalLoading =
    isUpdating || isLoadingRoom || isGettingSignature || isUploading;

  if (isLoadingRoom || skip) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="text-center text-red-500">Failed to load room data.</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800">
        Edit Room: {room.name}
      </h1>
      <Card className="mt-8">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label>Price/Night ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || 0}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label>Size (sqm)</label>
                <input
                  type="number"
                  name="size"
                  value={formData.size || 0}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || 0}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label>Features (comma-separated)</label>
              <input
                type="text"
                name="features"
                value={formData.features || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Amenities</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(amenitiesMap).map(([label, name]) => (
                  <div key={name} className="flex items-center">
                    <input
                      id={name}
                      name={name}
                      type="checkbox"
                      checked={formData[name] || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-gray-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={name}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Manage Images
              </label>
              <div className="mt-2 border rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-800">
                  Current Images
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                  {(formData.images || []).map((img: any) => (
                    <div key={img.id || img.publicId}>
                      <Image
                        src={img.url.replace(
                          "/upload/",
                          "/upload/f_auto,q_auto/"
                        )}
                        alt="Current room image"
                        width={100}
                        height={75}
                        className="rounded-md object-cover"
                      />
                    </div>
                  ))}
                </div>

                <label className="block text-sm font-medium text-gray-700 mt-4">
                  Upload New Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Uploading new images will{" "}
                  <span className="font-semibold">replace all</span> existing
                  ones.
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="md:col-span-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {errorMessage}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <Link
              href={`/rooms/${id}`}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={totalLoading}
              className="bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-700 flex items-center gap-2 disabled:bg-gray-400"
            >
              {totalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isGettingSignature
                ? "Preparing..."
                : isUploading
                ? "Uploading..."
                : isUpdating
                ? "Saving..."
                : "Update Room"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
