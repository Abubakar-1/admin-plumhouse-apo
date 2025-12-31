"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/api/baseApi";
import Card from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@guesthouse.com"); // Pre-fill for convenience
  const [password, setPassword] = useState("Password123!"); // Pre-fill for convenience
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // The `unwrap()` method will throw an error if the request fails
      await login({ email, password }).unwrap();
      // On successful login, the `onQueryStarted` in our apiSlice handles
      // setting the token in Redux and sessionStorage.
      // Now we just need to redirect.
      router.push("/"); // Redirect to the dashboard overview
    } catch (err: any) {
      const message =
        err.data?.message || "Login failed. Please check your credentials.";
      setErrorMessage(message);
      console.error("Failed to login: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Admin Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
