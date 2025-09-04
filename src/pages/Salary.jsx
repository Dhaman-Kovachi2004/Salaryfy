import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { calculateIncomeTax } from "../utils/taxCalculator.js";

const Salary = () => {
  const [ctc, setCtc] = useState("");
  const [breakdown, setBreakdown] = useState(null);

  const calculateBreakdown = (ctcValue) => {
    const value = parseFloat(ctcValue);
    if (isNaN(value) || value <= 0) return setBreakdown(null);

    // Earnings
    const basic = value * 0.40;
    const hra = basic * 0.50;
    const da = basic * 0.10;
    const lta = basic * 0.05;
    const bonus = value * 0.10;
    const specialAllowance = value - (basic + hra + da + lta + bonus);

    const pf = basic * 0.12;
    const professionalTax = value > 5000 ? 2400 : 0;
    const gross = basic + hra + da + lta + specialAllowance + bonus;

    // Tax calculation (reused)
    const taxInfo = calculateIncomeTax(gross);

    const totalDeductions = pf + professionalTax + taxInfo.totalTax;
    const netAnnual = Math.max(0, gross - totalDeductions);
    const netMonthly = Math.max(0, netAnnual / 12);

    setBreakdown({
      netAnnual: Math.round(netAnnual),
      netMonthly: Math.round(netMonthly),
      basic: Math.round(basic),
      hra: Math.round(hra),
      da: Math.round(da),
      lta: Math.round(lta),
      bonus: Math.round(bonus),
      specialAllowance: Math.round(specialAllowance),
      gross: Math.round(gross),
      pf: Math.round(pf),
      professionalTax,
      tax: taxInfo.totalTax,
      totalDeductions: Math.round(totalDeductions),
    });
  };

  useEffect(() => calculateBreakdown(ctc), [ctc]);

  const handleKeyDown = (e) => e.key === "Enter" && calculateBreakdown(ctc);
  const format = (num) => num.toLocaleString("en-IN");

  const exportExcel = () => {
    if (!breakdown) return;

    const excelData = [
      { Component: "Basic Salary", Amount: breakdown.basic },
      { Component: "HRA", Amount: breakdown.hra },
      { Component: "DA", Amount: breakdown.da },
      { Component: "LTA", Amount: breakdown.lta },
      { Component: "Special Allowance", Amount: breakdown.specialAllowance },
      { Component: "Performance Bonus", Amount: breakdown.bonus },
      { Component: "Gross Salary", Amount: breakdown.gross },
      { Component: "EPF (Employee)", Amount: breakdown.pf },
      { Component: "Professional Tax", Amount: breakdown.professionalTax },
      { Component: "Income Tax", Amount: breakdown.tax },
      { Component: "Total Deductions", Amount: breakdown.totalDeductions },
      { Component: "Net Annual Salary", Amount: breakdown.netAnnual },
      { Component: "Net Monthly Salary", Amount: breakdown.netMonthly },
    ];

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary Breakdown");
    XLSX.writeFile(wb, "salary-breakdown.xlsx");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Salary Breakdown Calculator
      </h2>

      <input
        type="text"
        placeholder="Enter your CTC (₹)"
        value={ctc}
        onChange={(e) => /^\d*$/.test(e.target.value) && setCtc(e.target.value)}
        onKeyDown={handleKeyDown}
        inputMode="numeric"
        pattern="[0-9]*"
        className="w-full px-4 py-3 border rounded-lg mb-6 
          bg-white text-gray-900 
          dark:bg-gray-700 dark:text-gray-100 
          dark:placeholder-gray-400 
          border-gray-300 dark:border-gray-600 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {breakdown && (
        <div className="space-y-6 text-sm">
          {/* Net Salary */}
          <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded transition-colors">
            <h3 className="font-bold text-lg text-green-900 dark:text-green-100 mb-1">
              Net Annual Salary: ₹{format(breakdown.netAnnual)}
            </h3>
            <p className="text-green-700 dark:text-green-200">
              Net Monthly Salary: ₹{format(breakdown.netMonthly)}
            </p>
          </div>

          {/* Earnings */}
          <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 rounded transition-colors">
            <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-2">
              Earnings
            </h3>
            <div className="grid grid-cols-2 gap-2 text-gray-800 dark:text-gray-100">
              <p>Basic Salary: ₹{format(breakdown.basic)}</p>
              <p>HRA: ₹{format(breakdown.hra)}</p>
              <p>DA: ₹{format(breakdown.da)}</p>
              <p>LTA: ₹{format(breakdown.lta)}</p>
              <p>Special Allowance: ₹{format(breakdown.specialAllowance)}</p>
              <p>Performance Bonus: ₹{format(breakdown.bonus)}</p>
              <p className="font-bold col-span-2">Gross Salary: ₹{format(breakdown.gross)}</p>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded transition-colors">
            <h3 className="font-bold text-lg text-red-900 dark:text-red-100 mb-2">
              Deductions
            </h3>
            <div className="grid grid-cols-2 gap-2 text-gray-800 dark:text-gray-100">
              <p>EPF (Employee): -₹{format(breakdown.pf)}</p>
              <p>Professional Tax: -₹{format(breakdown.professionalTax)}</p>
              <p>Income Tax: -₹{format(breakdown.tax)}</p>
              <p className="font-bold col-span-2">Total Deductions: -₹{format(breakdown.totalDeductions)}</p>
            </div>
          </div>

          {/* Download Excel */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={exportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
