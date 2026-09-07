import { configureStore } from "@reduxjs/toolkit";
import tabReducer from "./tabSlice";
import infooReducer from "./infoSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    tab: tabReducer,
    infoo:infooReducer,
    auth: authReducer
  },
});