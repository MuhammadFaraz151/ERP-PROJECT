import { configureStore } from "@reduxjs/toolkit";
import tabReducer from "./tabSlice";
import infooReducer from "./infoSlice";
import authReducer from "./authSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    tab: tabReducer,
    infoo:infooReducer,
    auth: authReducer,
    theme: themeReducer
  },
});