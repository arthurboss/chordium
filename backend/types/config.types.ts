export interface ServerConfig {
  port: number;
}

export interface CorsConfig {
  origin: string;
  methods: string[];
  credentials?: boolean;
}

export interface PuppeteerConfig {
  headless: boolean;
  args: string[];
}

export interface SupabaseConfig {
  url: string | undefined;
  serviceRoleKey: string | undefined;
}

export interface CifraClubConfig {
  baseUrl: string;
  blockedDomains: string[];
}

export interface Config {
  server: ServerConfig;
  cors: CorsConfig;
  puppeteer: PuppeteerConfig;
  supabase: SupabaseConfig;
  cifraClub: CifraClubConfig;
}
