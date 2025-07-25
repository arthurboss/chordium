export interface ServerConfig {
  port: number;
}

export interface CorsConfig {
  origin: string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
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

export interface AWSConfig {
  accessKeyId: string | undefined;
  secretAccessKey: string | undefined;
  sessionToken: string | undefined;
  region: string;
  bucketName: string | undefined;
}

export interface Config {
  server: ServerConfig;
  cors: CorsConfig;
  puppeteer: PuppeteerConfig;
  supabase: SupabaseConfig;
  cifraClub: CifraClubConfig;
  aws: AWSConfig;
}
