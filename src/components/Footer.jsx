import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Footer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <footer
      className={`text-center py-4 mt-10 rounded-t-lg transition-colors duration-300
        ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-600"}`}
    >
      <p className="text-sm">
        © {new Date().getFullYear()} Salaryfy. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
