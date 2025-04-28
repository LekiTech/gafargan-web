import { DataSource } from 'typeorm';
import { Word } from './src/repository/entities/Word';
import { WordDetail } from './src/repository/entities/WordDetail';
import { LangDialect } from './src/repository/entities/LangDialect';
import { User } from './src/repository/entities/User';
import { Source } from './src/repository/entities/Source';
import { Definition } from './src/repository/entities/Definition';
import { SpellingVariant } from './src/repository/entities/SpellingVariant';
import { Translation } from './src/repository/entities/Translation';
import { Language, Role } from './src/repository/entities/enums';

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
  entities: [Word, WordDetail, LangDialect, User, Source, Definition, SpellingVariant, Translation],
  migrations: [],
  subscribers: [],
});
