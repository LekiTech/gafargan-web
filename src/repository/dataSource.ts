'use server';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../ormconfig';

declare global {
  // Prevent TypeScript errors on global assignment
  var dataSource: DataSource | undefined;
}

export async function getDataSource(): Promise<DataSource> {
  if (!global.dataSource || !global.dataSource.isInitialized) {
    global.dataSource = AppDataSource;
    if (!global.dataSource.isInitialized) {
      await global.dataSource.initialize();
      console.log('Database connection established');
      console.log(global.dataSource.entityMetadatas.map((meta) => meta.name));
    }
  }

  return global.dataSource;
}
