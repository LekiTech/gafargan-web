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
  url: process.env.DATABASE_URL, // Database URL from environment variable
  synchronize: false, // Automatically sync the database (set to false in production)
  logging: false, // Optional, set to false in production
  entities: [Word, WordDetail, LangDialect, User, Source, Definition, SpellingVariant, Translation],
  migrations: [],
  subscribers: [],
});
