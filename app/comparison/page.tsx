// app/comparison/page.tsx
'use client';

// Zaroori imports: Hooks, Search Params, aur Types
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { sampleData as mockSampleData } from '@/data/sampleData'; // Mock data ka naam badal diya
import { SampleData } from '@/types'; // Data type
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Yeh component ab data fetch karega
const ComparisonClient = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SampleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Jab bhi URL badlega, yeh code chalega
    const isMock = searchParams.get('mock') === 'true';
    const country = searchParams.get('country');

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (isMock) {
          // 1. Agar mock=true hai, to local sample data load karo
          setData(mockSampleData);
        } else if (country) {
          // 2. Agar country hai, to API ko fetch karo
          const res = await fetch(`/api/biodiversity?country=${country}`);
          if (!res.ok) {
            throw new Error('Failed to fetch biodiversity data');
          }
          const jsonData: SampleData = await res.json();
          setData(jsonData);
        } else {
          // 3. Agar kuch nahi hai, to error do
          throw new Error('No country specified for analysis.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]); // Yeh [searchParams] par depend karta hai

  // --- RENDER LOGIC ---

  if (isLoading) {
    // Jab data load ho raha ho
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Analyzing Biodiversity...
        </h2>
        <p className="text-gray-500">
          Fetching live data from GBIF & IUCN...
        </p>
      </div>
    );
  }

  if (error) {
    // Agar koi error aaye
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Analysis Failed</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    // Agar data na mile
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">No data available.</h2>
      </div>
    );
  }

  // --- YEH AAPKA PURANA JSX HAI, LEKIN AB YEH 'data' STATE SE CHAL RAHA HAI ---
  const { location, biodiversityScore, carbonCredit, biodiversityData } = data;

  const priceData = [
    { name: 'Base Price', value: carbonCredit.basePrice, color: '#f87171' },
    {
      name: 'Adjusted Price',
      value: carbonCredit.adjustedPrice,
      color: '#34d399',
    },
  ];

  const scoreData = Object.entries(biodiversityScore.components).map(
    ([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      score: value,
    }),
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2 text-green-700">
        Bio-Verse AI Dashboard
      </h1>
      <p className="text-xl mb-10 text-gray-600">
        Biodiversity-Adjusted Carbon Credit Pricing for:{' '}
        <span className="font-semibold">{location.name}</span>
      </p>

      {/* Carbon Credit Comparison Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-red-400">
          <h2 className="text-2xl font-bold mb-4 text-red-700">
            Standard Carbon Price
          </h2>
          <p className="text-5xl font-extrabold">
            ${carbonCredit.basePrice.toFixed(2)}
          </p>
          <p className="text-gray-500 mt-2">USD per ton of CO₂e</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-green-400">
          <h2 className="text-2xl font-bold mb-4 text-green-700">
            Biodiversity-Adjusted Premium Price
          </h2>
          <p className="text-5xl font-extrabold text-green-600">
            ${carbonCredit.adjustedPrice.toFixed(2)}
          </p>
          <p className="text-gray-500 mt-2">
            Multiplier:{' '}
            <span className="font-bold">
              {carbonCredit.biodiversityMultiplier.toFixed(2)}x
            </span>{' '}
            (Premium: {carbonCredit.premiumPercentage}%)
          </p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white p-6 rounded-lg shadow-xl mb-12">
        <h3 className="text-xl font-semibold mb-6">Price Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              label={{
                value: 'Price (USD)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Bar dataKey="value">
              {priceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Biodiversity Score Dashboard */}
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold mb-6">
          Biodiversity Score & Metrics
        </h3>
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <span className="text-3xl font-bold">Overall Score:</span>
          <span className="text-6xl font-extrabold text-blue-600">
            {biodiversityScore.overall} / 100
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(biodiversityData.metrics).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// --- YEH NAYA HISSA HAI: SUSPENSE WRAPPER ---
// Next.js mein useSearchParams() ko Suspense boundary ki zaroorat hoti hai.
const ComparisonPage = () => {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <ComparisonClient />
    </Suspense>
  );
};

export default ComparisonPage;