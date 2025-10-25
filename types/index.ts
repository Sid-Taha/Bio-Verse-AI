// types\index.ts
export interface SampleData {
  location: {
    name: string;
    coordinates: { lat: number; lng: number };
    country: string;
  };
  biodiversityData: {
    totalSpecies: number;
    speciesList: {
      scientificName: string;
      commonName: string;
      taxonKey: number;
      occurrences: number;
      dnaSequence: string;
      source: string;
    }[];
    metrics: {
      shannonIndex: number;
      simpsonIndex: number;
      speciesRichness: number;
      endemicSpecies: number;
      threatenedSpecies: number;
    };
  };
  biodiversityScore: {
    overall: number;
    components: {
      diversity: number;
      rarity: number;
      endemism: number;
      conservation: number;
    };
  };
  carbonCredit: {
    basePrice: number;
    biodiversityMultiplier: number;
    adjustedPrice: number;
    premiumPercentage: number;
  };
}