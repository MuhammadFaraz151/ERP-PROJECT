import { createSlice } from "@reduxjs/toolkit";

const tabSlice = createSlice({
  name: "tabSlice",
  initialState: {
    tab: "Dashboard",
  },
  reducers: {
    setTab: (state, action) => {
      state.tab = action.payload;
    },
  },
});

export const { setTab } = tabSlice.actions;
export default tabSlice.reducer;