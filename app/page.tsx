// app\page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sampleData } from '@/data/sampleData';

const MainPage = () => {
  const [countryCode, setCountryCode] = useState('BR'); // Default to Brazil
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = async (useMock = false) => {
    if (useMock) {
        // Use the mock data path for immediate wow moment
        router.push('/comparison?mock=true'); 
        return;
    }

    // This is the real call to your Next.js API Route
    setIsLoading(true);
    try {
        // In a real app, you would fetch data here and then push to comparison
        // For the MVD, we'll just navigate to a placeholder comparison route with the real data query
        router.push(`/comparison?country=${countryCode}&mock=false`);
    } catch (error) {
        console.error("Analysis failed", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg p-10 bg-white rounded-xl shadow-2xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-green-700 mb-3">Bio-Verse AI 🌎🌱</h1>
          <p className="text-xl text-gray-600">Fair Carbon Credits Through Biodiversity Science.</p>
        </header>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">1. Select Region</h2>
          <div className="flex flex-col">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Country Code (e.g., BR, US, CA)
            </label>
            <input
              id="location"
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-lg"
              placeholder="BR"
              maxLength={2}
            />
          </div>

          <button
            onClick={() => handleAnalyze(false)}
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Biodiversity'}
          </button>
          
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              OR
            </span>
          </div>

          <button
            onClick={() => handleAnalyze(true)}
            className="w-full flex justify-center items-center py-3 px-4 border border-green-500 rounded-md shadow-sm text-lg font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            🚀 Use Sample Data (Demo Mode)
          </button>

        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          Powered by GBIF, NCBI, BOLD, and OpenAI.
        </p>
      </div>
    </div>
  );
};

export default MainPage;