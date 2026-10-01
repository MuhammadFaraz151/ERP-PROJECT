import { createSlice } from "@reduxjs/toolkit";

// Load settings from localStorage if available
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return {
    appName: 'BillStream Pro',
    storeName: 'Malik karyana Store',
    logo: null
  };
};

const infoSlice = createSlice({
  name: "infoSlice",
  initialState: {
    infoo: [],
    appSettings: loadSettings(),
  },
  reducers: {
    setinfoo: (state, action) => {
      state.infoo = action.payload;
    },
    setAppSettings: (state, action) => {
      state.appSettings = action.payload;
    },
  },
});

export const { setinfoo, setAppSettings } = infoSlice.actions;
export default infoSlice.reducer;