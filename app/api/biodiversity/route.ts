// app\api\biodiversity\route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

// 🚨 Use a small limit for demo and testing!
const GBIF_BASE_URL = 'https://api.gbif.org/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'BR'; // Default to Brazil

    // 1. Get species occurrences from GBIF
    // We fetch a list of distinct taxonKeys (species IDs) from a location
    const occurrenceResponse = await axios.get(`${GBIF_BASE_URL}/occurrence/search`, {
      params: {
        country: country,
        hasCoordinate: true,
        limit: 5, // 🚨 CRITICAL: Use a very small limit for testing and rate limits
        facet: 'taxonKey', // Facet to get a count of distinct species
        facetLimit: 10, // Only get the top 10 species for a quick demo
        // basisOfRecord: 'PRESERVED_SPECIMEN', // Optional: Filter for higher quality data
      }
    });

    const results = occurrenceResponse.data.results;
    const distinctSpecies = occurrenceResponse.data.facets.find((f: { field: string; }) => f.field === 'TAXON_KEY')?.counts || [];
    
    // 2. Fetch full species name for the top 3 keys
    // This is to simulate the full pipeline
    const speciesListPromises = distinctSpecies.slice(0, 3).map(async (item: { name: string; count: number; }) => {
        const taxonKey = item.name;
        // Lookup the species details from the key
        const speciesResponse = await axios.get(`${GBIF_BASE_URL}/species/${taxonKey}`);
        
        // Mock the rest of the data (DNA, score) for the MVD
        return {
            scientificName: speciesResponse.data.scientificName || `Unknown Species (${taxonKey})`,
            commonName: speciesResponse.data.vernacularName || 'N/A',
            taxonKey: taxonKey,
            occurrences: item.count,
            // 🚨 MOCK DATA: DNA sequence and source are mocked until the next step
            dnaSequence: "MOCKED_DNA_SEQUENCE_ATCG...", 
            source: "GBIF (mocked DNA)"
        };
    });

    const speciesList = await Promise.all(speciesListPromises);

    // 3. Construct a simplified response for the frontend
    const demoData = {
        location: { name: `GBIF Data for Country: ${country}`, country },
        biodiversityData: {
            totalSpecies: occurrenceResponse.data.count, // Total records, not total distinct species
            speciesList: speciesList,
            metrics: {
                speciesRichness: distinctSpecies.length, // Number of distinct species found
                shannonIndex: (Math.random() * 4).toFixed(2), // Mock metric
                threatenedSpecies: Math.floor(Math.random() * 5), // Mock metric
            }
        },
        // 🚨 MOCK DATA: Score and Carbon Credit are mocked until AI is integrated
        biodiversityScore: { overall: Math.floor(Math.random() * 40) + 60, components: {} },
        carbonCredit: { basePrice: 15, biodiversityMultiplier: 1.5, adjustedPrice: 22.5, premiumPercentage: 50 },
    };

    return NextResponse.json(demoData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error fetching biodiversity data' }, { status: 500 });
  }
}