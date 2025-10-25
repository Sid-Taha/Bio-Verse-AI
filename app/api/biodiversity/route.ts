// app/api/biodiversity/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

// Cache the response for 1 hour (3600 seconds)
export const revalidate = 3600;

const GBIF_BASE_URL = 'https://api.gbif.org/v1';
const IUCN_BASE_URL = 'https://apiv3.iucnredlist.org/api/v3';

/**
 * Calculates the Shannon Diversity Index.
 */
function calculateShannonIndex(speciesCounts: { name: string; count: number }[]): number {
  if (!speciesCounts || speciesCounts.length === 0) return 0;

  const totalIndividuals = speciesCounts.reduce((sum, s) => sum + s.count, 0);
  if (totalIndividuals === 0) return 0;

  let shannonIndex = 0;
  for (const species of speciesCounts) {
    const pi = species.count / totalIndividuals;
    if (pi > 0) {
      shannonIndex -= pi * Math.log(pi);
    }
  }
  return shannonIndex;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'BR'; // Default to Brazil

    // --- NAYA CODE SHURU: API Token access karna ---
    const iucnToken = process.env.IUCN_API_TOKEN;
    if (!iucnToken) {
      console.error('IUCN API Token not found!');
      // Production mein error throw karna behtar hai
      // throw new Error('IUCN API Token not configured');
    }
    // --- NAYA CODE KHATAM ---

    // 1. Get species occurrences from GBIF
    const occurrenceResponse = await axios.get(
      `${GBIF_BASE_URL}/occurrence/search`,
      {
        params: {
          country: country,
          hasCoordinate: true,
          limit: 5,
          facet: 'taxonKey',
          facetLimit: 20, // 20 species tak check karein ge
        },
      },
    );

    const distinctSpecies =
      occurrenceResponse.data.facets.find(
        (f: { field: string }) => f.field === 'TAXON_KEY',
      )?.counts || [];

    // 2. Har species ke liye GBIF aur IUCN se data fetch karein
    const speciesListPromises = distinctSpecies
      .slice(0, 10) // Demo ke liye sirf top 10 species check karein (API limits)
      .map(async (item: { name: string; count: number }) => {
        const taxonKey = item.name;

        // Step 2a: GBIF se species details lena
        const speciesResponse = await axios.get(
          `${GBIF_BASE_URL}/species/${taxonKey}`,
        );
        const scientificName = speciesResponse.data.scientificName;

        // --- NAYA CODE SHURU: IUCN Status fetch karna ---
        let iucnStatus = 'DD'; // Default: Data Deficient
        try {
          if (scientificName && iucnToken) {
            const iucnResponse = await axios.get(
              `${IUCN_BASE_URL}/species/name/${scientificName}?token=${iucnToken}`,
            );

            if (iucnResponse.data.result && iucnResponse.data.result.length > 0) {
              iucnStatus = iucnResponse.data.result[0].category; // e.g., 'LC', 'VU', 'EN'
            }
          }
        } catch (iucnError: any) {
          // Agar species IUCN par na mile (404) ya token ghalat ho
          console.error(
            `IUCN Error for ${scientificName}:`,
            iucnError.response?.status,
          );
          iucnStatus = 'NE'; // Not Evaluated
        }
        // --- NAYA CODE KHATAM ---

        return {
          scientificName: scientificName || `Unknown Species (${taxonKey})`,
          commonName: speciesResponse.data.vernacularName || 'N/A',
          taxonKey: taxonKey,
          occurrences: item.count,
          dnaSequence: 'MOCKED_DNA_SEQUENCE_ATCG...',
          source: 'GBIF + IUCN', // Source update ho gaya!
          conservationStatus: iucnStatus, // Naya data point
        };
      });

    const speciesList = await Promise.all(speciesListPromises);

    // 3. Real metrics calculate karein
    const speciesRichness = distinctSpecies.length;
    const rawShannonIndex = calculateShannonIndex(distinctSpecies);
    const normalizedShannon = Math.min(rawShannonIndex / 4.5, 1);

    // --- NAYA CODE SHURU: Real Threatened Species count ---
    const threatenedCategories = ['VU', 'EN', 'CR']; // Vulnerable, Endangered, Critically Endangered
    const threatenedSpeciesCount = speciesList.filter((species) =>
      threatenedCategories.includes(species.conservationStatus),
    ).length;
    // --- NAYA CODE KHATAM ---

    // 4. Real Score aur Price calculate karein
    const shannonScore = normalizedShannon * 80;
    const richnessScore = Math.min(speciesRichness / 100, 1) * 20;
    
    // --- NAYA CODE SHURU: Score mein threatened species ka impact ---
    // Agar 5 se ziyada threatened species hain, to score ko 10 points ka boost dein
    const conservationBonus = threatenedSpeciesCount > 5 ? 10 : (threatenedSpeciesCount > 0 ? 5 : 0);
    const overallScore = Math.min(Math.floor(shannonScore + richnessScore + conservationBonus), 100);
    // --- NAYA CODE KHATAM ---

    const basePrice = 15;
    const biodiversityMultiplier = 1 + overallScore / 100;
    const adjustedPrice = basePrice * biodiversityMultiplier;
    const premiumPercentage = (biodiversityMultiplier - 1) * 100;

    // 5. Final response tayyar karein
    const demoData = {
      location: {
        name: `GBIF Data for Country: ${country}`,
        country: country,
        coordinates: { lat: 0, lng: 0 },
      },
      biodiversityData: {
        totalSpecies: occurrenceResponse.data.count,
        speciesList: speciesList, // Ismein ab IUCN status bhi hai
        metrics: {
          speciesRichness: speciesRichness, // REAL
          shannonIndex: parseFloat(rawShannonIndex.toFixed(2)), // REAL
          simpsonIndex: parseFloat(
            (1 - 1 / (rawShannonIndex * rawShannonIndex)).toFixed(2) || 0.8,
          ), // MOCKED
          endemicSpecies: Math.floor(speciesRichness * 0.1), // MOCKED
          // --- REAL DATA YAHAN ISTEMAL HO RAHA HAI ---
          threatenedSpecies: threatenedSpeciesCount, // REAL
        },
      },
      biodiversityScore: {
        overall: overallScore, // REAL (improved)
        components: {
          diversity: Math.floor(shannonScore), // REAL
          rarity: 0, // MOCKED
          endemism: 0, // MOCKED
          conservation: Math.floor(richnessScore + conservationBonus), // REAL (improved)
        },
      },
      carbonCredit: {
        basePrice: basePrice, // REAL
        biodiversityMultiplier: parseFloat(biodiversityMultiplier.toFixed(2)), // REAL
        adjustedPrice: parseFloat(adjustedPrice.toFixed(2)), // REAL
        premiumPercentage: parseFloat(premiumPercentage.toFixed(0)), // REAL
      },
    };

    return NextResponse.json(demoData);
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { message: 'Error fetching biodiversity data', error: error.message },
      { status: 500 },
    );
  }
}