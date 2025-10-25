// data\sampleData.ts
import { SampleData } from '../types'; // Define this type for better safety

export const sampleData: SampleData = {
  location: {
    name: "Amazon Rainforest, Brazil (Demo Data)",
    coordinates: { lat: -3.4653, lng: -62.2159 },
    country: "BR"
  },
  biodiversityData: {
    totalSpecies: 156,
    speciesList: [
      {
        scientificName: "Panthera onca",
        commonName: "Jaguar",
        taxonKey: 5219404,
        occurrences: 12,
        dnaSequence: "ATCGATCG...",
        source: "GBIF+GenBank"
      },
      {
        scientificName: "Aotus azarae",
        commonName: "Azara's night monkey",
        taxonKey: 5786435,
        occurrences: 5,
        dnaSequence: "GCTAGCTA...",
        source: "GBIF+GenBank"
      }
      // ... more mock species
    ],
    metrics: {
      shannonIndex: 3.45,
      simpsonIndex: 0.92,
      speciesRichness: 156,
      endemicSpecies: 23,
      threatenedSpecies: 8
    }
  },
  biodiversityScore: {
    overall: 87,
    components: {
      diversity: 90,
      rarity: 85,
      endemism: 82,
      conservation: 89
    }
  },
  carbonCredit: {
    basePrice: 15,
    biodiversityMultiplier: 1.45,
    adjustedPrice: 21.75,
    premiumPercentage: 45
  }
};