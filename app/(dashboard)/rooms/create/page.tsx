/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Link from "next/link";

import { Loader2 } from "lucide-react";
import {
  useCreateRoomMutation,
  useLazyGetUploadSignatureQuery,
} from "@/api/baseApi";

// Helper component for displaying field-specific errors
const FieldError = ({ messages }: { messages?: string[] }) => {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1 text-sm text-red-600">{messages[0]}</p>;
};

// Helper object to map display names to form input names
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

export default function CreateRoomPage() {
  const router = useRouter();
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();

  // Use the lazy query hook to get a trigger function
  const [triggerGetSignature, { isLoading: isGettingSignature }] =
    useLazyGetUploadSignatureQuery();

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrors, setFormErrors] = useState<{
    [key: string]: string[] | undefined;
  }>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setErrorMessage("");
    setFormErrors({});

    const formData = new FormData(formRef.current);
    const roomData = Object.fromEntries(formData.entries());

    try {
      let uploadedImages: any = [];

      if (files.length > 0) {
        setIsUploading(true);
        // Trigger the lazy query to get the signature
        const sigResult = await triggerGetSignature();

        if (sigResult.isError || !sigResult.data) {
          throw new Error("Could not get upload signature from server.");
        }

        const sigData = sigResult.data;

        const uploadPromises = files.map(async (file) => {
          const cloudinaryFormData = new FormData();
          cloudinaryFormData.append("file", file);
          cloudinaryFormData.append(
            "api_key",
            process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!
          );
          cloudinaryFormData.append("timestamp", sigData.timestamp.toString());
          cloudinaryFormData.append("signature", sigData.signature);
          cloudinaryFormData.append("folder", "guesthouse-rooms");

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env
              .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!}/image/upload`,
            {
              method: "POST",
              body: cloudinaryFormData,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cloudinary upload failed: ${errorText}`);
          }
          return response.json();
        });

        const uploadResults = await Promise.all(uploadPromises);
        uploadedImages = uploadResults.map((result, index) => ({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: index === 0,
        }));
        setIsUploading(false);
      }

      const finalPayload = {
        ...roomData,
        features: roomData.features,
        images: uploadedImages,
        ...Object.entries(amenitiesMap).reduce((acc, [_, name]) => {
          (acc as any)[name] = roomData[name] === "on";
          return acc;
        }, {}),
      };

      await createRoom(finalPayload).unwrap();

      alert("Room created successfully!");
      router.push("/rooms");
    } catch (err: any) {
      setIsUploading(false);
      const errorData = err.data;
      if (errorData?.error?.fieldErrors) {
        setFormErrors(errorData.error.fieldErrors);
        setErrorMessage("Please correct the errors highlighted below.");
      } else {
        setErrorMessage(
          err.message || "An unknown error occurred. Please try again."
        );
      }
      console.error("Failed to create room:", err);
    }
  };

  const totalLoading = isUploading || isCreating || isGettingSignature;

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800">Create New Room</h1>
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
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <FieldError messages={formErrors.name} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
              <FieldError messages={formErrors.description} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price/Night ($)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <FieldError messages={formErrors.price} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size (sqm)
                </label>
                <input
                  type="number"
                  name="size"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <FieldError messages={formErrors.size} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <FieldError messages={formErrors.capacity} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Features (comma-separated)
              </label>
              <input
                type="text"
                name="features"
                placeholder="High-End Bedding, Smart TV"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <FieldError messages={formErrors.features} />
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
                Room Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                First selected image will be the primary one.
              </p>
            </div>
          </div>
          {errorMessage && (
            <div className="md:col-span-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {errorMessage}
            </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <Link
              href="/rooms"
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={totalLoading}
              className="bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-700 flex items-center justify-center gap-2 disabled:bg-gray-400 w-40"
            >
              {totalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isGettingSignature
                ? "Preparing..."
                : isUploading
                ? "Uploading..."
                : isCreating
                ? "Saving..."
                : "Save Room"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
