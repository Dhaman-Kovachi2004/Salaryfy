// src/utils/taxUtils.js

/**
 * Calculates income tax based on FY 2025-26 New Regime slabs.
 * Returns taxableIncome, totalTax, standardDeduction, and optionally slab breakdown for step-by-step.
 */
export const calculateIncomeTax = (income) => {
  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];

  const standardDeduction = 75000;
  let taxableIncome = Math.max(0, income - standardDeduction);

  let totalTax = 0;
  let remainingIncome = taxableIncome;
  let prevLimit = 0;

  // Slab-wise calculation
  for (const slab of slabs) {
    if (remainingIncome <= 0) break;

    const taxableInThisSlab = Math.min(remainingIncome, slab.limit - prevLimit);
    totalTax += taxableInThisSlab * slab.rate;

    remainingIncome -= taxableInThisSlab;
    prevLimit = slab.limit;
  }

  // Section 87A rebate & marginal relief
  if (taxableIncome <= 1200000) totalTax = 0;
  else if (taxableIncome <= 1275000) {
    const excess = taxableIncome - 1200000;
    if (totalTax > excess) totalTax = excess;
  }

  totalTax = Math.round(totalTax * 1.04); // Add 4% Health & Education Cess

  return {
    taxableIncome,
    totalTax,
    standardDeduction,
  };
};
