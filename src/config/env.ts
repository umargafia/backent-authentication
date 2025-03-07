import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().default('mongodb://127.0.0.1:27017/payment-gateway'),
  JWT_SECRET: z.string().default('dev-super-secret-jwt-key-123'),
  JWT_EXPIRES_IN: z.string().default('90d'),
  EMAIL_HOST: z.string().default('smtp.mailtrap.io'),
  EMAIL_PORT: z.string().default('2525'),
  EMAIL_USERNAME: z.string().default('test'),
  EMAIL_PASSWORD: z.string().default('test'),
  EMAIL_FROM: z.string().default('noreply@paymentgateway.com'),
});

type Env = z.infer<typeof envSchema>;

const parseEnvVars = (): Env => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      console.warn(
        `Warning: Missing or invalid environment variables: ${missingVars}. Using default values.`
      );
      return envSchema.parse({});
    }
    throw error;
  }
};

export const env = parseEnvVars();
