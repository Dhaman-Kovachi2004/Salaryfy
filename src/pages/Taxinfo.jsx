import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const Taxinfo = () => {
  const [income, setIncome] = useState("");
  const [taxDetails, setTaxDetails] = useState(null);
  const [showSteps, setShowSteps] = useState(true);

  const format = (num) =>
    num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const calculateTax = (value) => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      setTaxDetails(null);
      return;
    }

    const slabs = [
      { limit: 400000, rate: 0 },
      { limit: 800000, rate: 0.05 },
      { limit: 1200000, rate: 0.1 },
      { limit: 1600000, rate: 0.15 },
      { limit: 2000000, rate: 0.2 },
      { limit: 2400000, rate: 0.25 },
      { limit: Infinity, rate: 0.3 },
    ];

    let totalTax = 0;
    const slabBreakdown = [];
    const taxSteps = [];

    // Standard Deduction
    const standardDeduction = Math.min(75000, amount - 300000);
    let taxableIncome = amount - standardDeduction;

    slabBreakdown.push({
      slabRange: "Standard Deduction",
      rate: "-",
      taxable: standardDeduction,
      tax: 0,
      type: "deduction",
    });
    taxSteps.push(
      `Standard Deduction applied: ₹${format(
        standardDeduction
      )} → Taxable Income: ₹${format(taxableIncome)}`
    );

    let remainingIncome = taxableIncome;
    let prevLimit = 0;

    // Slab-wise calculation
    for (const slab of slabs) {
      if (remainingIncome <= 0) break;

      const slabLower = prevLimit + 1;
      const slabUpper =
        slab.limit === Infinity ? remainingIncome + prevLimit : slab.limit;
      const taxableInThisSlab = Math.min(
        remainingIncome,
        slabUpper - prevLimit
      );
      const taxInThisSlab = taxableInThisSlab * slab.rate;

      taxSteps.push(
        `Income ₹${format(slabLower)} - ₹${
          slab.limit === Infinity ? "∞" : format(slab.limit)
        } → Taxable: ₹${format(taxableInThisSlab)}, Rate: ${
          slab.rate * 100
        }% → Tax: ₹${format(taxInThisSlab)}`
      );

      slabBreakdown.push({
        slabRange: `${format(slabLower)} - ${
          slab.limit === Infinity ? "∞" : format(slab.limit)
        }`,
        rate: slab.rate * 100 + "%",
        taxable: taxableInThisSlab,
        tax: taxInThisSlab,
        type: "tax",
      });

      totalTax += taxInThisSlab;
      remainingIncome -= taxableInThisSlab;
      prevLimit = slab.limit;
    }

    // Section 87A rebate
    if (taxableIncome <= 1200000) {
      const rebate = Math.min(60000, totalTax);
      totalTax -= rebate;
      taxSteps.push(
        `Section 87A rebate applied: ₹${format(
          rebate
        )} → Tax after rebate: ₹${format(totalTax)}`
      );
    }

    // Marginal Relief
    if (taxableIncome > 1200000 && taxableIncome <= 1275000) {
      const excess = taxableIncome - 1200000;
      if (totalTax > excess) {
        taxSteps.push(
          `Marginal Relief applied → Tax reduced to excess over ₹12L = ₹${format(
            excess
          )}`
        );
        totalTax = excess;
      }
    }

    totalTax = totalTax * 1.04; // 4% Health & Education Cess
    taxSteps.push(
      `4% Health & Education Cess applied → Total Tax Payable: ₹${format(
        totalTax
      )}`
    );

    const netIncome = amount - totalTax;
    const effectiveTaxRate = (totalTax / amount) * 100;

    taxSteps.push(`Final Net Income: ₹${format(netIncome)}`);

    setTaxDetails({
      slabBreakdown,
      taxSteps,
      totalTax,
      netIncome,
      effectiveTaxRate,
      income: amount,
      standardDeduction,
      taxableIncome,
    });
  };

  useEffect(() => {
    calculateTax(income);
  }, [income]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") calculateTax(income);
  };

  // ===== Excel Export =====
  const exportExcel = () => {
    if (!taxDetails) return;

    const excelData = [];

    // Standard Deduction
    excelData.push({
      Component: "Standard Deduction",
      Taxable: taxDetails.standardDeduction,
      Tax: 0,
    });

    // Slab-wise
    taxDetails.slabBreakdown
      .filter((s) => s.type === "tax")
      .forEach((s) => {
        excelData.push({
          Component: `Slab ${s.slabRange}`,
          Taxable: s.taxable,
          Tax: s.tax,
        });
      });

    // Total & Net
    excelData.push(
      {
        Component: "Total Tax Payable (incl. Cess)",
        Taxable: "",
        Tax: taxDetails.totalTax,
      },
      { Component: "Net Income", Taxable: "", Tax: taxDetails.netIncome }
    );

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tax Details");
    XLSX.writeFile(wb, "tax-details.xlsx");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6">
        Income Tax Calculator (New Regime FY 25-26)
      </h2>

      <input
        type="text"
        placeholder="Enter your Annual Income (₹)"
        value={income}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*$/.test(value)) setIncome(value);
        }}
        onKeyDown={handleKeyDown}
        inputMode="numeric"
        pattern="[0-9]*"
        className="w-full px-4 py-3 border rounded-lg mb-6 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {taxDetails && (
        <div className="space-y-6 text-sm">
          {/* Tax Summary */}
          <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-4 rounded text-gray-900 dark:text-gray-100 transition-colors">
            <h3 className="font-bold text-lg mb-1">
              Total Tax Payable: ₹{format(taxDetails.totalTax)}
            </h3>
            <p>Net Income After Tax: ₹{format(taxDetails.netIncome)}</p>
            <p>Effective Tax Rate: {taxDetails.effectiveTaxRate.toFixed(2)}%</p>
          </div>

          {/* Step-by-Step Calculation */}
          <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 rounded transition-colors">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-lg text-yellow-900 dark:text-yellow-100">
                Step-by-Step Summary
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!taxDetails?.taxSteps?.length) return;
                    const text = taxDetails.taxSteps.join("\n");
                    navigator.clipboard.writeText(text);
                  }}
                  className="text-xs px-2 py-1 rounded border border-yellow-400 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-800"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => setShowSteps((v) => !v)}
                  className="text-xs px-2 py-1 rounded border border-yellow-400 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-800"
                >
                  {showSteps ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {showSteps && (
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-800 dark:text-gray-100 marker:text-yellow-600 dark:marker:text-yellow-300 max-h-60 overflow-auto">
                {taxDetails.taxSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Slab Breakdown Table */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h3 className="font-bold text-lg text-blue-800 mb-2">
              Slab-wise Tax Breakdown
            </h3>
            <table className="w-full text-left border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-gray-100">
                  <th className="border px-2 py-1">Slab Range</th>
                  <th className="border px-2 py-1">Rate</th>
                  <th className="border px-2 py-1">Taxable Amount (₹)</th>
                  <th className="border px-2 py-1">Tax (₹)</th>
                </tr>
              </thead>
              <tbody>
                {taxDetails.slabBreakdown.map((slab, idx) => (
                  <tr
                    key={idx}
                    className={
                      slab.type === "deduction"
                        ? "bg-yellow-50 dark:bg-yellow-900"
                        : idx % 2 === 0
                        ? "bg-blue-50 dark:bg-gray-700"
                        : "dark:bg-gray-800"
                    }
                  >
                    <td className="border px-2 py-1 text-gray-900 dark:text-gray-100">
                      {slab.slabRange}
                    </td>
                    <td className="border px-2 py-1 text-gray-900 dark:text-gray-100">
                      {slab.rate}
                    </td>
                    <td className="border px-2 py-1 text-gray-900 dark:text-gray-100">
                      {format(slab.taxable)}
                    </td>
                    <td className="border px-2 py-1 text-gray-900 dark:text-gray-100">
                      {format(slab.tax)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Excel Download Button at the very bottom */}
          <div className="flex justify-end">
            <button
              onClick={exportExcel}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Taxinfo;
