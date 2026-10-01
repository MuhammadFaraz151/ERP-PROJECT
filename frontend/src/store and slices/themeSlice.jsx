import { createSlice } from "@reduxjs/toolkit";

// Load theme from localStorage if available
const loadTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
  } catch (error) {
    console.error('Error loading theme:', error);
  }
  return 'dark'; // Default to dark mode
};

const themeSlice = createSlice({
  name: "themeSlice",
  initialState: {
    theme: loadTheme(),
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Save to localStorage for persistence
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
