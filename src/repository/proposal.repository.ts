'use server';
import { getDataSource } from './dataSource';
import {
  DefinitionSchema,
  ProposalSchema,
  SpellingVariantSchema,
  TranslationSchema,
  WordDetailSchema,
  WordSchema,
} from './entities/schemas';
import { Proposal } from './entities/Proposal';
import { ProposalStatus, ProposalType } from './entities/enums';
import { Translation } from './entities/Translation';
import { Repository } from 'typeorm';
import {
  DictionaryProposalModel,
  DictionaryProposalModelNestedType,
  SourceModelType,
  STATE,
  StateType,
  TranslationModelType,
} from '@/dashboard/models/proposal.model';
import { Word } from './entities/Word';
import { SpellingVariant } from './entities/SpellingVariant';
import { WordDetail } from './entities/WordDetail';
import { Definition } from './entities/Definition';
import { DUMMY_USER_ID } from './constants';

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
    order: {
      proposedAt: 'asc',
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
  console.log(`Saved Proposal: ${saved}`);
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
  // NOTE: for the case if someone changes his mind, allow changing from any other status to approved
  if (proposalEntity.status === ProposalStatus.APPROVED) {
    throw new Error(`Proposal ${proposalId} is already approved`);
  }
  proposalEntity.status = ProposalStatus.APPROVED;
  proposalEntity.reviewedById = adminId;
  proposalEntity.reviewedAt = new Date();
  // Save the proposal
  // TODO: add/modify/delete all values to the correct tables
  await dictionaryV3ProposalToDbChanges(proposalEntity);
}

async function dictionaryV3ProposalToDbChanges(proposal: Proposal) {
  if (
    proposal.data == undefined ||
    !('version' in proposal.data && proposal.data.version === 'V3') ||
    !('entries' in proposal.data) ||
    !('source' in proposal.data)
  ) {
    console.log(proposal);
    throw new Error(`Proposal ${proposal.id} contains data incompatible with V3 dictionary`);
  }
  const AppDataSource = await getDataSource();
  await AppDataSource.transaction(async (manager) => {
    const proposalRepo = manager.getRepository<Proposal>(ProposalSchema.options.tableName!);
    await proposalRepo.save(proposal);

    const wordRepo = manager.getRepository<Word>(WordSchema.options.tableName!);
    const spellingVariantRepo = manager.getRepository<SpellingVariant>(
      SpellingVariantSchema.options.tableName!,
    );
    const wordDetailRepo = manager.getRepository<WordDetail>(WordDetailSchema.options.tableName!);
    const translationRepo = manager.getRepository<Translation>(
      TranslationSchema.options.tableName!,
    );
    const definitionRepo = manager.getRepository<Definition>(DefinitionSchema.options.tableName!);

    const dictionaryProposal: DictionaryProposalModelNestedType =
      proposal.data as DictionaryProposalModelNestedType;
    for (const word of dictionaryProposal.entries) {
      if ((word.state === STATE.MODIFIED || word.state === STATE.DELETED) && !word.id) {
        throw new Error(`Modified/deleted word "${word.spelling}" is missing id`);
      }
      if (word.state === STATE.DELETED) {
        await wordRepo.delete(word.id);
        // no need to continue inside the word, as it should be deleted with all of it inside (except for translations)
      } else {
        let createdWord: Word | undefined = undefined;
        if (word.state === STATE.ADDED) {
          const wordEntity = wordRepo.create({
            ...word,
            spelling: word.spelling.toUpperCase(),
            sourceId: word.sourceId,
            createdById: DUMMY_USER_ID,
            updatedById: DUMMY_USER_ID,
          });
          createdWord = await wordRepo.save(wordEntity);
        } else if (word.state === STATE.MODIFIED) {
          await wordRepo.update(word.id, {
            spelling: word.spelling.toUpperCase(),
            langDialectId: word.langDialectId,
            sourceId: word.sourceId,
            updatedById: DUMMY_USER_ID,
          });
        }
        for (const spellingVariant of word.spellingVariants) {
          switch (spellingVariant.state) {
            case STATE.ADDED:
              const spellingVariantEntity = spellingVariantRepo.create({
                ...spellingVariant,
                spelling: spellingVariant.spelling.toUpperCase(),
                sourceId: spellingVariant.sourceId,
                createdById: DUMMY_USER_ID,
                updatedById: DUMMY_USER_ID,
              });
              await spellingVariantRepo.save(spellingVariantEntity);
              break;
            case STATE.DELETED:
              await spellingVariantRepo.delete(spellingVariant.id);
              break;
            case STATE.MODIFIED:
              await spellingVariantRepo.update(spellingVariant.id, {
                spelling: spellingVariant.spelling.toUpperCase(),
                langDialectId: spellingVariant.langDialectId,
                sourceId: spellingVariant.sourceId,
                updatedById: DUMMY_USER_ID,
              });
              break;
            default:
              console.log(`Nothing to do with spellingVariant with ID = ${spellingVariant.id}`);
          }
        }
        for (let i = 0; i < word.wordDetails.length; i++) {
          const wordDetail = word.wordDetails[i];
          let createdWordDetail: WordDetail | undefined = undefined;
          if (wordDetail.state === STATE.DELETED) {
            await wordDetailRepo.delete(wordDetail.id);
            // no need to continue inside the word, as it should be deleted with all of it inside (except for translations)
          } else {
            if (wordDetail.state === STATE.ADDED) {
              const wordEntity = wordDetailRepo.create({
                ...wordDetail,
                orderIdx: i,
                inflection:
                  wordDetail.inflection?.trim().length === 0 ? undefined : wordDetail.inflection,
                wordId: word.state === STATE.ADDED ? createdWord!.id : word.id,
                sourceId: wordDetail.sourceId,
                createdById: DUMMY_USER_ID,
                updatedById: DUMMY_USER_ID,
              });
              createdWordDetail = await wordDetailRepo.save(wordEntity);
            } else if (wordDetail.state === STATE.MODIFIED) {
              const existingWordDetail = await wordDetailRepo.findOne({
                where: { id: wordDetail.id },
                relations: { examples: true },
              });

              if (!existingWordDetail) {
                throw new Error(`WordDetail ${wordDetail.id} not found`);
              }
              const providedInflection = wordDetail.inflection?.trim() ?? null;
              existingWordDetail.inflection =
                providedInflection?.length === 0 ? null : providedInflection;
              existingWordDetail.langDialectId = wordDetail.langDialectId;
              existingWordDetail.sourceId = wordDetail.sourceId;
              //   // TODO: add to the db model
              // existing.tags = wordDetail.tags;
              existingWordDetail.updatedById = DUMMY_USER_ID;

              const wordDetailExamples =
                wordDetail.examples?.map((example) => ({
                  ...example,
                  createdById: DUMMY_USER_ID,
                  updatedById: DUMMY_USER_ID,
                })) ?? [];
              existingWordDetail.examples = wordDetailExamples as any;
              await wordDetailRepo.save(existingWordDetail);
              // if (wordDetailExamples.length > 0) {
              //   await handleTranslationsProposalDbChanges(translationRepo, wordDetailExamples);
              // }
            }

            for (const definition of wordDetail.definitions) {
              if (definition.state === STATE.DELETED) {
                await definitionRepo.delete(definition.id);
                // no need to continue inside the word, as it should be deleted with all of it inside (except for translations)
              } else {
                switch (definition.state) {
                  case STATE.ADDED:
                    const definitionEntity = definitionRepo.create({
                      ...definition,
                      wordDetailsId:
                        wordDetail.state === STATE.ADDED ? createdWordDetail!.id : wordDetail.id,
                      values: definition.values,
                      createdById: DUMMY_USER_ID,
                      updatedById: DUMMY_USER_ID,
                    });
                    await definitionRepo.save(definitionEntity);
                    break;
                  case STATE.MODIFIED:
                    const existingDefinition = await definitionRepo.findOne({
                      where: { id: definition.id },
                      relations: { examples: true },
                    });

                    if (!existingDefinition) {
                      throw new Error(`Definition ${definition.id} not found`);
                    }
                    existingDefinition.values = definition.values;
                    existingDefinition.tags = definition.tags ?? [];
                    existingDefinition.updatedById = DUMMY_USER_ID;

                    const definitionExamples =
                      definition.examples?.map((example) => ({
                        ...example,
                        createdById: DUMMY_USER_ID,
                        updatedById: DUMMY_USER_ID,
                      })) ?? [];
                    existingDefinition.examples = definitionExamples as any;
                    await definitionRepo.save(existingDefinition);
                    break;
                  default:
                    console.log(`Nothing to do with definition with ID = ${definition.id}`);
                }

                const definitionExamples =
                  definition.examples?.map((example) => ({
                    ...example,
                    createdById: DUMMY_USER_ID,
                    updatedById: DUMMY_USER_ID,
                  })) ?? [];
                if (definitionExamples.length > 0) {
                  await handleTranslationsProposalDbChanges(translationRepo, definitionExamples);
                }
              }
            }
          }
        }
      }
    }
  });
}

async function handleTranslationsProposalDbChanges(
  translationRepo: Repository<Translation>,
  translations: TranslationModelType[],
) {
  for (const translation of translations) {
    switch (translation.state) {
      case STATE.ADDED:
        const translationEntity = translationRepo.create(translation);
        await translationRepo.save({
          ...translationEntity,
          createdById: DUMMY_USER_ID,
          updatedById: DUMMY_USER_ID,
        });
        break;
      // On deletion should only remove the link to translation record, but not delete the translation itself
      // case STATE.DELETED:
      //   await translationRepo.delete(translation.id);
      //   break;
      case STATE.MODIFIED:
        await translationRepo.update(translation.id, {
          phrasesPerLangDialect: translation.phrasesPerLangDialect,
          tags: translation.tags,
          updatedById: DUMMY_USER_ID,
        });
        break;
      default:
        console.log(`Nothing to do with translation with ID = ${translation.id}`);
    }
  }
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
  // If proposal ws approved previously, rejecting it will not change anything
  //    in public data from other tables than `proposal`
  // For this reason only allow rejecting proposals with status `PENDING`
  if (proposalEntity.status !== ProposalStatus.PENDING) {
    throw new Error(`Proposal ${proposalId} is not pending`);
  }
  proposalEntity.status = ProposalStatus.REJECTED;
  proposalEntity.comment = comment;
  proposalEntity.reviewedById = adminId;
  proposalEntity.reviewedAt = new Date();
  await repo.save(proposalEntity);
}
