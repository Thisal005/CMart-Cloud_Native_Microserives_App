export interface EnvFieldRules {
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  default?: any;
  choices?: readonly string[];
}

export interface EnvSchema {
  [key: string]: EnvFieldRules;
}

/**
 * Validates process.env against a schema.
 * Throws errors and exits the application on startup if validation fails.
 * Bypasses exit in test environments to allow tests to run cleanly.
 */
export function validateEnv<T extends Record<string, any>>(schema: EnvSchema): T {
  const result: any = {};
  const errors: string[] = [];

  for (const [key, rules] of Object.entries(schema)) {
    let value = process.env[key];

    if (value === undefined || value === '') {
      if (rules.required) {
        errors.push(`Missing required environment variable: ${key}`);
        continue;
      }
      value = rules.default;
    }

    if (value !== undefined) {
      if (rules.type === 'number') {
        const parsed = Number(value);
        if (isNaN(parsed)) {
          errors.push(`Environment variable ${key} must be a number, got: ${value}`);
        } else {
          result[key] = parsed;
        }
      } else if (rules.type === 'boolean') {
        result[key] = value === 'true' || value === '1';
      } else {
        result[key] = String(value);
      }

      if (rules.choices && !rules.choices.includes(result[key])) {
        errors.push(`Environment variable ${key} must be one of [${rules.choices.join(', ')}], got: ${result[key]}`);
      }
    } else {
      result[key] = undefined;
    }
  }

  if (errors.length > 0) {
    if (process.env.NODE_ENV === 'test') {
      console.warn('⚠️ Configuration validation warnings during test run:');
      errors.forEach(err => console.warn(`   - ${err}`));
    } else {
      console.error('❌ Configuration validation failed during startup:');
      errors.forEach(err => console.error(`   - ${err}`));
      process.exit(1);
    }
  }

  return result as T;
}
