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
import { ProposalStatus, ProposalOperation } from './entities/enums';
import { LangDialect } from './entities/LangDialect';
import { DefinitionValue } from './entities/Definition';
import { TranslationPhrase } from './entities/Translation';
import { EntitySchema } from 'typeorm';

// Map table_name → corresponding entity class
const tableEntityMap: Record<string, EntitySchema> = {
  [SourceSchema.options.tableName!]: SourceSchema,
  [WordSchema.options.tableName!]: WordSchema,
  [SpellingVariantSchema.options.tableName!]: SpellingVariantSchema,
  [WordDetailSchema.options.tableName!]: WordDetailSchema,
  [DefinitionSchema.options.tableName!]: DefinitionSchema,
  [TranslationSchema.options.tableName!]: TranslationSchema,
};

export async function getAvailableTables(): Promise<{ tableName: string; name: string }[]> {
  return Promise.resolve(
    Object.values(tableEntityMap).map((tem) => ({
      tableName: tem.options.tableName!,
      name: tem.options.name!,
    })),
  );
}

export interface SourceProposal {
  name?: string;
  authors?: string;
  publicationYear?: string;
  providedBy?: string;
  providedByUrl?: string;
  processedBy?: string;
  copyright?: string;
  seeSourceUrl?: string;
  description?: string;
}
export interface SpellingVariantProposal {
  langDialect?: LangDialect;
  word_id?: number;
  spelling?: string;
}
export interface WordProposal {
  spelling?: string;
  langDialect?: LangDialect;
}
export interface WordDetailProposal {
  word_id?: number;
  orderIdx?: number;
  inflection?: string;
  langDialect?: LangDialect;
  source_id?: number;
}
export interface DefinitionProposal {
  word_details_id?: number;
  values?: DefinitionValue[];
  tags?: string[];
}
export interface TranslationProposal {
  phrasesPerLangDialect?: Record<string, TranslationPhrase>;
  tags?: string[];
  raw?: string;
}

export interface CreateProposalDto {
  tableName: string;
  operation: ProposalOperation;
  recordId?: number; // required for UPDATE/DELETE
  newData?:
    | SourceProposal
    | SpellingVariantProposal
    | WordProposal
    | WordDetailProposal
    | DefinitionProposal
    | TranslationProposal; //Record<string, any>; // required for INSERT/UPDATE
  proposedById: number;
}

export async function createProposal(dto: CreateProposalDto): Promise<Proposal> {
  const { tableName, operation, recordId, newData, proposedById } = dto;

  const EntityClass = tableEntityMap[tableName];
  if (!EntityClass) {
    throw new Error(`Unknown table name: ${tableName}`);
  }
  if (
    ![ProposalOperation.INSERT, ProposalOperation.UPDATE, ProposalOperation.DELETE].includes(
      operation,
    )
  ) {
    throw new Error(`Invalid operation: ${operation}`);
  }

  const AppDataSource = await getDataSource();
  return AppDataSource.transaction(async (manager) => {
    const propRepo = manager.getRepository(Proposal);

    // Build the base proposal
    const prop = propRepo.create({
      tableName,
      operation,
      recordId: null,
      newData: null,
      oldData: null,
      proposedById,
      status: ProposalStatus.PENDING,
      reviewedById: null,
      reviewedAt: null,
    });

    switch (prop.operation) {
      case ProposalOperation.INSERT: {
        // For INSERT: require newData
        if (!newData) {
          throw new Error(`INSERT proposals require newData`);
        }
        prop.newData = newData;
        break;
      }

      case ProposalOperation.UPDATE: {
        // For UPDATE: require both recordId and newData, and fetch oldData
        if (recordId == null) {
          throw new Error(`UPDATE proposals require recordId`);
        }
        if (!newData) {
          throw new Error(`UPDATE proposals require newData`);
        }

        prop.recordId = recordId;
        prop.newData = newData;

        const repo = manager.getRepository(tableName);
        const existing = await repo.findOne({ where: { id: recordId } });
        if (!existing) {
          throw new Error(`Cannot propose update: no ${tableName} row with id=${recordId}`);
        }
        // capture the existing row as JSON
        prop.oldData = { ...existing } as any;
        break;
      }

      case ProposalOperation.DELETE: {
        // For DELETE: require recordId, fetch oldData
        if (recordId == null) {
          throw new Error(`DELETE proposals require recordId`);
        }

        prop.recordId = recordId;
        const repo = manager.getRepository(tableName);
        const existing = await repo.findOne({ where: { id: recordId } });
        if (!existing) {
          throw new Error(`Cannot propose delete: no ${tableName} row with id=${recordId}`);
        }
        prop.oldData = { ...existing } as any;
      }

      default:
        throw new Error(`Unknown operation ${prop.operation}`);
    }
    // Save the proposal
    const saved = await propRepo.save(prop);
    return saved;
  });
}

/**
 * Approve and apply a proposal by ID.
 * @param proposalId The PK of the proposal row
 * @param adminId    The user ID performing the approval
 */
export async function approveProposal(proposalId: number, adminId: number) {
  const AppDataSource = await getDataSource();
  await AppDataSource.transaction(async (manager) => {
    const repo = manager.getRepository(ProposalSchema.options.tableName!);
    const prop = await repo.findOne({ where: { id: proposalId } });
    if (!prop) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    if (prop.status !== ProposalStatus.PENDING) {
      throw new Error(`Proposal ${proposalId} is not pending`);
    }

    const EntityClass = tableEntityMap[prop.tableName];
    if (!EntityClass) {
      throw new Error(`No entity mapped for table ${prop.tableName}`);
    }
    const targetRepo = manager.getRepository(prop.tableName);

    switch (prop.operation) {
      case ProposalOperation.INSERT: {
        if (!prop.newData) {
          throw new Error(`INSERT proposal ${proposalId} has no new_data`);
        }
        // create and save: fires history triggers on your real tables
        const entity = targetRepo.create(prop.newData);
        const saved = await targetRepo.save(entity);
        // store the new record ID back on the proposal
        prop.recordId = (saved as any).id;
        break;
      }

      case ProposalOperation.UPDATE: {
        if (!prop.recordId || !prop.newData) {
          throw new Error(`UPDATE proposal ${proposalId} missing record_id or new_data`);
        }
        await targetRepo.update(prop.recordId, prop.newData);
        break;
      }

      case ProposalOperation.DELETE: {
        if (!prop.recordId) {
          throw new Error(`DELETE proposal ${proposalId} missing record_id`);
        }
        await targetRepo.delete(prop.recordId);
        break;
      }

      default:
        throw new Error(`Unknown operation ${prop.operation}`);
    }

    // mark the proposal as approved
    prop.status = ProposalStatus.APPROVED;
    prop.reviewedById = adminId;
    prop.reviewedAt = new Date();
    await repo.save(prop);
  });
}

/**
 * Reject a pending proposal.
 */
export async function rejectProposal(proposalId: number, adminId: number) {
  const AppDataSource = await getDataSource();
  const repo = AppDataSource.getRepository(ProposalSchema.options.tableName!);
  const prop = await repo.findOne({ where: { id: proposalId } });
  if (!prop) {
    throw new Error(`Proposal ${proposalId} not found`);
  }
  if (prop.status !== ProposalStatus.PENDING) {
    throw new Error(`Proposal ${proposalId} is not pending`);
  }
  prop.status = ProposalStatus.REJECTED;
  prop.reviewedById = adminId;
  prop.reviewedAt = new Date();
  await repo.save(prop);
}
