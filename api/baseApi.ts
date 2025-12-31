// lib/features/api/apiSlice.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { setCredentials } from "@/features/auth/authSlice";
import { RootState } from "@/features/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * A custom base query function that wraps fetchBaseQuery.
 * It prepares headers with the auth token and can be extended for centralized error handling.
 */
const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: (headers, { getState }) => {
    // Attempt to get the token from the Redux state first
    let token = (getState() as RootState).auth.token;

    // If the token isn't in the Redux state (e.g., after a page refresh),
    // try to get it from the cookie.
    if (!token) {
      token = Cookies.get("token");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// You can keep a custom wrapper like this for advanced centralized logic,
// such as automatic re-authentication or global error handling.
const baseQueryWithAuth: typeof baseQuery = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Example of centralized 401 handling. You can expand this as needed.
  if (result.error && result.error.status === 401) {
    console.error(
      "Unauthorized request detected. Future logic could handle token refresh or auto-logout."
    );
    // Example: api.dispatch(logOut());
  }

  return result;
};

const tagTypes = ["Room", "Booking"];

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth, // Using the custom wrapper
  tagTypes: tagTypes,
  endpoints: (builder) => ({
    // === AUTH ENDPOINTS ===
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/admin/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.data?.token;
          if (token) {
            // Dispatch the action to store the token in the Redux auth slice
            dispatch(setCredentials({ token }));
            // Set the token in a secure, HttpOnly-like cookie for web
            Cookies.set("token", token, {
              expires: 1,
              secure: true,
              sameSite: "strict",
            });
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    getUploadSignature: builder.query<
      { timestamp: number; signature: string },
      void
    >({
      query: () => "/admin/uploads/signature",
      transformResponse: (response: { data: any }) => response.data,
    }),

    // === ROOM ENDPOINTS ===
    getRooms: builder.query<any[], void>({
      query: () => "/admin/rooms",
      /**
       * CORRECTED: Use transformResponse to extract the nested `data` array
       * from our standard API envelope `{ success, message, data }`.
       * This ensures the cached data and the `result` in `providesTags` is the array itself.
       */
      transformResponse: (response: { data: any[] }) => response.data,
      providesTags: (result = []) => [
        { type: "Room", id: "LIST" },
        ...result.map(({ id }) => ({ type: "Room" as const, id })),
      ],
    }),

    getRoomById: builder.query<any, number>({
      query: (id) => `/admin/rooms/${id}`,
      // Also transform the response for a single item
      transformResponse: (response: { data: any }) => response.data,
      providesTags: (result, error, id) => [{ type: "Room", id }],
    }),

    createRoom: builder.mutation<any, any>({
      // The payload is now a JSON object
      query: (roomData) => ({
        url: "/admin/rooms",
        method: "POST",
        body: roomData, // No longer FormData
      }),
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),
    updateRoom: builder.mutation<any, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/admin/rooms/${id}`,
        method: "PUT",
        body: formData,
      }),
      // The invalidation logic is based on arguments, which is correct and robust.
      invalidatesTags: (result, error, { id }) => [
        { type: "Room", id },
        { type: "Room", id: "LIST" },
      ],
    }),

    deleteRoom: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),
    getBookings: builder.query<any[], void>({
      query: () => "/admin/bookings",
      /**
       * CORRECTED: Use transformResponse to extract the nested `data` array
       * from our standard API envelope `{ success, message, data }`.
       * This ensures the cached data and the `result` in `providesTags` is the array itself.
       */
      transformResponse: (response: { data: any[] }) => response.data,
      providesTags: (result = []) => [
        { type: "Booking", id: "LIST" },
        ...result.map(({ id }) => ({ type: "Booking" as const, id })),
      ],
    }), // Future Booking endpoints would go here...
  }),
});

// Export the auto-generated hooks for use in components
export const {
  useGetUploadSignatureQuery,
  useLazyGetUploadSignatureQuery,
  useLoginMutation,
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetBookingsQuery,
} = apiSlice;
