import path from 'node:path';
import fs from 'node:fs';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface AppConfig {
  env: AppEnvironment;
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  port: number;
  databasePath: string;
  backupDir: string;
  appUrl: string;
  version: string;
  secrets: {
    geminiApiKeyStatus: 'configured' | 'missing';
    sessionSecretStatus: 'configured' | 'default';
  };
  security: {
    enforceHttps: boolean;
    hstsMaxAge: number;
    cspEnabled: boolean;
  };
}

/**
 * Resolve application environment strictly
 */
export function getAppEnvironment(): AppEnvironment {
  const rawEnv = (process.env.APP_ENV || process.env.NODE_ENV || 'development').toLowerCase().trim();
  if (rawEnv === 'production' || rawEnv === 'prod') {
    return 'production';
  }
  if (rawEnv === 'staging' || rawEnv === 'stage' || rawEnv === 'uat' || rawEnv === 'test') {
    return 'staging';
  }
  return 'development';
}

/**
 * Enforce environment-specific database path and prevent cross-environment pollution.
 * CRITICAL RULE: Development systems MUST NEVER point to or write into Production databases!
 */
export function resolveDatabasePath(env: AppEnvironment): string {
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const customDbFile = process.env.DATABASE_FILE?.trim();

  if (customDbFile) {
    const normalizedCustom = customDbFile.toLowerCase();

    // Guardrail: Never allow development or staging to target production db
    if (env !== 'production' && (normalizedCustom.includes('prod') || normalizedCustom.includes('production'))) {
      const errorMsg = `[CRITICAL SECURITY GUARD] Cannot connect to Production database file (${customDbFile}) while running in '${env}' environment! Development and Staging must be completely isolated from Production data.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    return path.isAbsolute(customDbFile) ? customDbFile : path.resolve(process.cwd(), customDbFile);
  }

  // Default isolated filenames per environment
  switch (env) {
    case 'production':
      return path.join(dataDir, 'mcu_academic_prod.sqlite');
    case 'staging':
      return path.join(dataDir, 'mcu_academic_staging.sqlite');
    case 'development':
    default:
      // If legacy single file exists, use it in dev, otherwise use dev-specific file
      const legacyPath = path.join(dataDir, 'mcu_academic.sqlite');
      const devPath = path.join(dataDir, 'mcu_academic_dev.sqlite');
      if (fs.existsSync(legacyPath) && !fs.existsSync(devPath)) {
        return legacyPath;
      }
      return devPath;
  }
}

/**
 * Load application configuration
 */
export function loadAppConfig(): AppConfig {
  const env = getAppEnvironment();
  const databasePath = resolveDatabasePath(env);
  const backupDir = process.env.BACKUP_DIR
    ? path.resolve(process.cwd(), process.env.BACKUP_DIR)
    : path.resolve(process.cwd(), 'data', 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  let version = '1.0.0';
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    version = pkg.version || '1.0.0';
  } catch {
    // fallback
  }

  return {
    env,
    isProduction: env === 'production',
    isStaging: env === 'staging',
    isDevelopment: env === 'development',
    port: Number(process.env.PORT) || 3000,
    databasePath,
    backupDir,
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    version,
    secrets: {
      geminiApiKeyStatus: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      sessionSecretStatus: process.env.SESSION_SECRET ? 'configured' : 'default',
    },
    security: {
      enforceHttps: env === 'production',
      hstsMaxAge: 31536000, // 1 year
      cspEnabled: true,
    },
  };
}

export const appConfig = loadAppConfig();
