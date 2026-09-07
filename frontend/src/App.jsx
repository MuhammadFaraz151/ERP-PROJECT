import { Provider } from "react-redux";
import Home from "./components/Home";
import Login from "./components/Auth/Login";
import { store } from "./store and slices/Store";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./store and slices/authSlice";

const AppContent = () => {
  const[invoice,setInvoice]=useState(false)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    // Check for existing token and user in localStorage
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (token && user) {
      dispatch(setUser(user))
    }
  }, [dispatch])

  const handleLogin = (user) => {
    dispatch(setUser(user))
  }

  const handleLogout = () => {
    dispatch({ type: 'auth/logout' })
  }

  return !isAuthenticated ? (
    <Login onLogin={handleLogin} />
  ) : (
    <Home setInvoice={setInvoice} invoice={invoice} onLogout={handleLogout} />
  )
}

const App = () => {
  return (
    <div>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </div>
  );
};

export default App;