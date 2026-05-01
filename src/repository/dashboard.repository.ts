'use server';

import { getDataSource } from './dataSource';
import {
  DefinitionSchema,
  ProposalSchema,
  SourceSchema,
  TranslationSchema,
  WordSchema,
} from './entities/schemas';
import { ProposalStatus } from './entities/enums';

export type DashboardStats = {
  words: number;
  definitions: number;
  translations: number;
  sources: number;
  pendingProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const AppDataSource = await getDataSource();
  const proposalRepo = AppDataSource.getRepository(ProposalSchema.options.tableName!);

  const [
    words,
    definitions,
    translations,
    sources,
    pendingProposals,
    approvedProposals,
    rejectedProposals,
  ] = await Promise.all([
    AppDataSource.getRepository(WordSchema.options.tableName!).count(),
    AppDataSource.getRepository(DefinitionSchema.options.tableName!).count(),
    AppDataSource.getRepository(TranslationSchema.options.tableName!).count(),
    AppDataSource.getRepository(SourceSchema.options.tableName!).count(),
    proposalRepo.count({ where: { status: ProposalStatus.PENDING } }),
    proposalRepo.count({ where: { status: ProposalStatus.APPROVED } }),
    proposalRepo.count({ where: { status: ProposalStatus.REJECTED } }),
  ]);

  return {
    words,
    definitions,
    translations,
    sources,
    pendingProposals,
    approvedProposals,
    rejectedProposals,
  };
}
