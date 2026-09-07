import { createSlice } from "@reduxjs/toolkit";

const infoSlice = createSlice({
  name: "infoSlice",
  initialState: {
    infoo: [],
  },
  reducers: {
    setinfoo: (state, action) => {
      
      state.infoo = action.payload;
    },
  },
});

export const { setinfoo } = infoSlice.actions;
export default infoSlice.reducer;