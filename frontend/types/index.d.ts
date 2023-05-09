export interface Movie {
  _id: string;
  _index: string;
  _score: number;
  _source: {
    budget: number;
    genres: string[];
    keywords: string[];
    original_language: string;
    overview: string;
    popularity: number;
    production_companies: string[];
    production_countries: string[];
    release_date: string;
    revenue: number;
    runtime: string;
    spoken_languages: string[];
    status: string;
    tagline: string;
    title: string;
    vote_average: number;
  };
}

export interface User {
  id: number;
  label: string;
}
