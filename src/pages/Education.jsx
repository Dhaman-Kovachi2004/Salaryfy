import React, { useState } from 'react';
import { FiBook, FiSearch } from 'react-icons/fi';

const Education = () => {
  const topics = [
    {
      title: "What is CTC?",
      content:
        "CTC (Cost to Company) is the total salary package offered to an employee, including basic salary, allowances, bonuses, and benefits like PF and gratuity.",
      link: "https://www.investopedia.com/terms/c/cost-to-company-ctc.asp"
    },
    {
      title: "Tax Slabs (New Regime, FY 2025)",
      content:
        "Under the new regime, income up to ₹12,00,000 is tax-free (after standard deduction of ₹75,000). Above this, tax is charged at progressive slab rates starting from 5%.",
      link: "https://incometaxindia.gov.in"
    },
    {
      title: "In-Hand Salary vs. CTC",
      content:
        "Your in-hand salary is what you actually receive after deductions like tax, PF, and professional tax. It is usually less than your CTC.",
      link: "https://cleartax.in/s/ctc-full-form-cost-to-company"
    },
    {
      title: "Why Investments Matter?",
      content:
        "Investments in instruments like ELSS, NPS, or fixed deposits not only help you grow wealth but also provide tax-saving benefits.",
      link: "https://www.investopedia.com/investing-4427685"
    }
  ];

  const glossary = [
    { term: "PF", definition: "Provident Fund – A retirement savings scheme where both employer and employee contribute." },
    { term: "HRA", definition: "House Rent Allowance – Part of salary given to employees for paying rent, tax-exempt under certain conditions." },
    { term: "ELSS", definition: "Equity Linked Savings Scheme – A tax-saving mutual fund with a lock-in period of 3 years." },
    { term: "NPS", definition: "National Pension System – A government-backed retirement savings scheme with tax benefits." },
    { term: "Gratuity", definition: "A lump sum paid by the employer as a gratitude for service, applicable after 5 years of service." }
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const filteredGlossary = glossary.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Education Cards */}
      <div className="md:col-span-2 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiBook className="text-blue-600" /> Financial Education
        </h2>

        {topics.map((item, index) => (
          <div
            key={index}
            className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-3 hover:underline cursor-pointer">{item.title}</h3>
            <p className="text-gray-700 mb-4">{item.content}</p>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Learn More →
            </a>
          </div>
        ))}
      </div>

      {/* Glossary Section */}
      <aside className="bg-white shadow-md rounded-xl p-6 h-fit md:sticky md:top-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiBook className="text-yellow-600" /> Glossary
        </h3>

        {/* Search Box */}
        <div className="mb-4 flex items-center gap-2 border rounded-lg px-3 py-2">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm text-gray-700"
          />
        </div>

        <div className="space-y-3 max-h-[450px] overflow-y-auto">
          {filteredGlossary.length > 0 ? (
            filteredGlossary.map((item, idx) => (
              <div key={idx} className="border-b pb-2 hover:bg-yellow-50 rounded transition px-2">
                <p className="font-semibold text-blue-600">{item.term}</p>
                <p className="text-gray-700 text-sm">{item.definition}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No terms found.</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Education;
