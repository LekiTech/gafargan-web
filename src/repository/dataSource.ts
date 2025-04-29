'use server';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
// import { DataSource } from 'typeorm';
// import { Word } from './entities/Word';
// import { WordDetail } from './entities/WordDetail';
// import { LangDialect } from './entities/LangDialect';
// import { User } from './entities/User';
// import { Source } from './entities/Source';
// import { Definition } from './entities/Definition';
// import { SpellingVariant } from './entities/SpellingVariant';
// import { Translation } from './entities/Translation';
// import { Language, Role } from './entities/enums';

// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   url: process.env.DATABASE_URL,
//   entities: [Word, WordDetail, LangDialect, User, Source, Definition, SpellingVariant, Translation],
//   synchronize: false, // set to true only in dev
//   logging: false,
// });
import { AppDataSource } from '../../ormconfig';

export async function getDataSource(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Database connection established');
    console.log(AppDataSource.entityMetadatas.map((meta) => meta.name));
  }
  return AppDataSource;
}
