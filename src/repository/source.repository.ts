'use server';
import { SourceModelType } from '@/dashboard/models/proposal.model';
import { getDataSource } from './dataSource';
import { Source } from './entities/Source';
import { SourceSchema } from './entities/schemas';

export async function getSources(): Promise<Source[]> {
  const AppDataSource = await getDataSource();
  const sourceRepo = AppDataSource.getRepository(SourceSchema.options.tableName!);
  const sources = await sourceRepo.find({
    select: {
      id: true,
      name: true,
      authors: true,
      publicationYear: true,
      providedBy: true,
      providedByUrl: true,
      processedBy: true,
      copyright: true,
      seeSourceUrl: true,
      description: true,
    },
  });
  // console.log('search', JSON.stringify(word, null, 2));
  return JSON.parse(JSON.stringify(sources));
}

// TODO: test
export async function createSource(source: SourceModelType): Promise<Source> {
  const AppDataSource = await getDataSource();
  const sourceRepo = AppDataSource.getRepository<Source>(SourceSchema.options.tableName!);
  const sourceEntity = sourceRepo.create(source);

  const createdSource = await sourceRepo.save(sourceEntity);

  return createdSource;
}
