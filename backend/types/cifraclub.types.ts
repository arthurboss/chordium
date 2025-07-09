// Centralized types for CifraClub scraping and utilities

export interface LoadStrategy {
  name: string;
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout: number;
  waitAfter: number;
}
