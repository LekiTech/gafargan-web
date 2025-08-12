import {
  WordSchema,
  WordDetailSchema,
  LangDialectSchema,
  UserSchema,
  SourceSchema,
  DefinitionSchema,
  SpellingVariantSchema,
  TranslationSchema,
  ProposalSchema,
  DefinitionExampleSchema,
  WordDetailsExampleSchema,
} from '@repository/entities/schemas';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  // url: process.env.DATABASE_URL, // Database URL from environment variable
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  ssl:
    process.env.DATABASE_SSL !== 'false'
      ? process.env.CA_CERT
        ? {
            rejectUnauthorized: true,
            ca: process.env.CA_CERT,
          }
        : {
            rejectUnauthorized: false,
          }
      : false,
  synchronize: false, // Automatically sync the database (set to false in production)
  logging: false, // Optional, set to false in production
  entities: [
    WordSchema,
    WordDetailSchema,
    LangDialectSchema,
    UserSchema,
    SourceSchema,
    DefinitionSchema,
    SpellingVariantSchema,
    TranslationSchema,
    ProposalSchema,
    DefinitionExampleSchema,
    WordDetailsExampleSchema,
  ],
  migrations: [],
  subscribers: [],
});
