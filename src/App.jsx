import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Taxinfo from "./pages/Taxinfo";
import Salary from "./pages/Salary";
import Education from "./pages/Education";
import Footer from "./components/Footer";
import { ThemeContext } from "./context/ThemeContext.jsx";

const App = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 
      ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      <Navbar />

      <main className="flex-grow p-6">
        <Routes>
          <Route path="/" element={<Salary />} />
          <Route path="/tax" element={<Taxinfo />} />
          <Route path="/education" element={<Education />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
