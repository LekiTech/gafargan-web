import 'server-only';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../ormconfig';

declare global {
  // Prevent TypeScript errors on global assignment
  var dataSource: DataSource | undefined;
  // Shared in-flight initialization, so concurrent requests don't initialize twice
  var dataSourceInitialization: Promise<DataSource> | undefined;
}

export async function getDataSource(): Promise<DataSource> {
  if (global.dataSource?.isInitialized) {
    return global.dataSource;
  }

  if (!global.dataSourceInitialization) {
    global.dataSource = AppDataSource;
    global.dataSourceInitialization = (
      global.dataSource.isInitialized ? Promise.resolve(global.dataSource) : global.dataSource.initialize()
    )
      .then((dataSource) => {
        console.log('Database connection established');
        console.log(dataSource.entityMetadatas.map((meta) => meta.name));
        return dataSource;
      })
      .finally(() => {
        // Allow a retry on the next call if initialization failed
        global.dataSourceInitialization = undefined;
      });
  }

  return global.dataSourceInitialization;
}
