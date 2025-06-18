import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [input, setInput] = useState("");

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get("/api/blog/all");
      data.success ? setBlogs(data.blogs) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to fetch blogs");
    }
  };

  // Function to set token and update axios headers
  const updateToken = (newToken) => {
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } else {
      setToken(null);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  const value = {
    axios,
    navigate,
    token,
    setToken: updateToken, // Use the wrapper function instead
    blogs,
    setBlogs,
    input,
    setInput,
    fetchBlogs,
  };

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      // Load token from localStorage
      const savedToken = localStorage.getItem("token");
      if (savedToken && isMounted) {
        setToken(savedToken);
        // Add "Bearer " prefix here
        axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      }

      // Fetch blogs
      try {
        const { data } = await axios.get("/api/blog/all");
        if (isMounted) {
          data.success ? setBlogs(data.blogs) : toast.error(data.message);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || "Failed to fetch blogs");
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
