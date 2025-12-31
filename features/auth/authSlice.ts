// lib/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  // You can add user info here as well if your login endpoint returns it
  // user: { email: string } | null;
}

const initialState: AuthState = {
  token: null,
  // user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to set the token upon successful login
    setCredentials: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    // Action to clear the token upon logout
    logOut: (state) => {
      state.token = null;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

// Selector to easily access the token from the state
export const selectCurrentToken = (state: { auth: AuthState }) =>
  state.auth.token;
