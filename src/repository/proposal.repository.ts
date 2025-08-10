'use server';
import { getDataSource } from './dataSource';
import {
  DefinitionSchema,
  ProposalSchema,
  SourceSchema,
  SpellingVariantSchema,
  TranslationSchema,
  WordDetailSchema,
  WordSchema,
} from './entities/schemas';
import { Proposal } from './entities/Proposal';
import { ProposalStatus, ProposalType } from './entities/enums';
import { LangDialect } from './entities/LangDialect';
import { DefinitionValue } from './entities/Definition';
import { TranslationPhrase } from './entities/Translation';
import { EntitySchema } from 'typeorm';
import {
  DictionaryProposalModel,
  SourceModelType,
  TranslationModelType,
} from '@/dashboard/models/proposal.model';

export type PaginationQuery = {
  type: ProposalType;
  page: number;
  size: number;
  status?: ProposalStatus;
  // wordLangDialectId: number;
  // definitionsLangDialectId: number;
};
export async function getPaginatedProposals({
  type,
  status,
  page,
  size,
  // wordLangDialectId,
  // definitionsLangDialectId,
}: PaginationQuery): Promise<Proposal[]> {
  // status = status ?? ProposalStatus.PENDING;
  const AppDataSource = await getDataSource();
  const proposalRepo = AppDataSource.getRepository<Proposal>(ProposalSchema.options.tableName!);
  const proposals = await proposalRepo.find({
    where: {
      type,
      status,
      // langDialect: { id: wordLangDialectId },
      // details: { langDialect: { id: definitionsLangDialectId } },
    },
    take: size,
    skip: page * size,
    relations: {
      proposedBy: true,
      reviewedBy: true,
    },
  });
  // console.log('search', JSON.stringify(word, null, 2));
  return JSON.parse(JSON.stringify(proposals));
}

export interface CreateProposalDto {
  type: ProposalType;
  data: DictionaryProposalModel | SourceModelType | TranslationModelType;
  proposedById: number;
}

export async function createProposal(dto: CreateProposalDto): Promise<Proposal> {
  const { type, data, proposedById } = dto;

  if (![ProposalType.SOURCE, ProposalType.DICTIONARY, ProposalType.TRANSLATIONS].includes(type)) {
    throw new Error(`Invalid proposal type: ${type}`);
  }

  const AppDataSource = await getDataSource();
  const proposalRepo = AppDataSource.getRepository<Proposal>(ProposalSchema.options.tableName!);
  const proposalEntity = proposalRepo.create({
    type,
    data,
    proposedById,
    status: ProposalStatus.PENDING,
  });
  // Save the proposal
  const saved = await proposalRepo.save(proposalEntity);
  return saved;
}

/**
 * Approve and apply a proposal by ID.
 * @param proposalId The PK of the proposal row
 * @param adminId    The user ID performing the approval
 */
export async function approveProposal(proposalId: number, adminId: number) {
  const AppDataSource = await getDataSource();
  const proposalRepo = AppDataSource.getRepository<Proposal>(ProposalSchema.options.tableName!);
  const proposalEntity = await proposalRepo.findOne({ where: { id: proposalId } });
  if (!proposalEntity) {
    throw new Error(`Proposal ${proposalId} not found`);
  }
  // NOTE: for the case if someone changes his mind
  // if (proposalEntity.status !== ProposalStatus.PENDING) {
  //   throw new Error(`Proposal ${proposalId} is not pending`);
  // }
  proposalEntity.status = ProposalStatus.APPROVED;
  proposalEntity.reviewedById = adminId;
  proposalEntity.reviewedAt = new Date();
  // Save the proposal
  await proposalRepo.save(proposalEntity);
  // TODO: add/modify/delete all values to the correct tables
}

/**
 * Reject a pending proposal.
 * @param proposalId The PK of the proposal row
 * @param adminId    The user ID performing the rejection
 */
export async function rejectProposal(proposalId: number, adminId: number, comment: string) {
  const AppDataSource = await getDataSource();
  const repo = AppDataSource.getRepository<Proposal>(ProposalSchema.options.tableName!);
  const proposalEntity = await repo.findOne({ where: { id: proposalId } });
  if (!proposalEntity) {
    throw new Error(`Proposal ${proposalId} not found`);
  }
  if (proposalEntity.status !== ProposalStatus.PENDING) {
    throw new Error(`Proposal ${proposalId} is not pending`);
  }
  proposalEntity.status = ProposalStatus.REJECTED;
  proposalEntity.comment = comment;
  proposalEntity.reviewedById = adminId;
  proposalEntity.reviewedAt = new Date();
  await repo.save(proposalEntity);
}
