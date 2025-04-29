import { EntitySchema } from 'typeorm';
import { Definition } from './Definition';
import { LangDialect } from './LangDialect';
import { Source } from './Source';
import { SpellingVariant } from './SpellingVariant';
import { Translation } from './Translation';
import { User } from './User';
import { Word } from './Word';
import { WordDetail } from './WordDetail';
import { Language, Role } from './enums';

export const DefinitionSchema = new EntitySchema<Definition>({
  name: 'Definition',
  tableName: 'definition',
  target: Definition,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    values: {
      type: 'json',
      array: true,
    },
    tags: {
      type: 'text',
      array: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    wordDetails: {
      type: 'many-to-one',
      target: () => WordDetail,
      joinColumn: { name: 'word_details_id' },
      inverseSide: 'definitions',
      nullable: true,
    },
    createdBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'created_by' },
      inverseSide: 'createdDefinitions',
    },
    updatedBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'updated_by' },
      inverseSide: 'updatedDefinitions',
    },
    examples: {
      type: 'many-to-many',
      target: () => Translation,
      joinTable: {
        name: 'definition_example',
        joinColumn: { name: 'definition_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'translation_id', referencedColumnName: 'id' },
      },
      cascade: false,
    },
  },
});

export const LangDialectSchema = new EntitySchema<LangDialect>({
  name: 'LangDialect',
  tableName: 'lang_dialect',
  target: LangDialect,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    language: {
      type: 'enum',
      enum: Language,
      enumName: 'Language',
      nullable: true,
    },
    dialect: {
      type: 'text',
      unique: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    words: {
      type: 'one-to-many',
      target: () => Word,
      inverseSide: 'langDialect',
    },
    wordDetails: {
      type: 'one-to-many',
      target: () => WordDetail,
      inverseSide: 'langDialect',
    },
    spellingVariants: {
      type: 'one-to-many',
      target: () => SpellingVariant,
      inverseSide: 'langDialect',
    },
  },
});

export const SourceSchema = new EntitySchema<Source>({
  name: 'Source',
  tableName: 'source',
  target: Source,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: 'text',
    },
    authors: {
      type: 'text',
      nullable: true,
    },
    publicationYear: {
      name: 'publication_year',
      type: 'text',
      nullable: true,
    },
    providedBy: {
      name: 'provided_by',
      type: 'text',
      nullable: true,
    },
    providedByUrl: {
      name: 'provided_by_url',
      type: 'text',
      nullable: true,
    },
    processedBy: {
      name: 'processed_by',
      type: 'text',
      nullable: true,
    },
    copyright: {
      type: 'text',
      nullable: true,
    },
    seeSourceUrl: {
      name: 'see_source_url',
      type: 'text',
      nullable: true,
    },
    description: {
      type: 'text',
      nullable: true,
      select: false,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    createdBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'created_by' },
      inverseSide: 'createdSources',
    },
    updatedBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'updated_by' },
      inverseSide: 'updatedSources',
    },
    wordDetails: {
      type: 'one-to-many',
      target: () => WordDetail,
      inverseSide: 'source',
    },
  },
});

export const SpellingVariantSchema = new EntitySchema<SpellingVariant>({
  name: 'SpellingVariant',
  tableName: 'spelling_variant',
  target: SpellingVariant,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    spelling: {
      type: 'text',
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    langDialect: {
      type: 'many-to-one',
      target: () => LangDialect,
      joinColumn: { name: 'lang_dialect_id' },
      inverseSide: 'spellingVariants',
      nullable: true,
    },
    word: {
      type: 'many-to-one',
      target: () => Word,
      joinColumn: { name: 'word_id' },
      inverseSide: 'spellingVariants',
    },
  },
});

export const TranslationSchema = new EntitySchema<Translation>({
  name: 'Translation',
  tableName: 'translations',
  target: Translation,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    phrasesPerLangDialect: {
      name: 'phrases_per_lang_dialect',
      type: 'jsonb',
    },
    tags: {
      type: 'text',
      array: true,
    },
    raw: {
      type: 'text',
      nullable: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    createdBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'created_by' },
      inverseSide: 'createdTranslations',
    },
    updatedBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'updated_by' },
      inverseSide: 'updatedTranslations',
    },
  },
});

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  tableName: 'user',
  target: User,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: 'text',
      nullable: true,
    },
    email: {
      type: 'text',
      unique: true,
      select: false,
    },
    password: {
      type: 'text',
      select: false,
    },
    language: {
      type: 'enum',
      enum: Language,
      enumName: 'Language',
      nullable: true,
      select: false,
    },
    verified: {
      type: 'boolean',
      default: false,
    },
    role: {
      type: 'enum',
      enum: Role,
      enumName: 'Role',
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      select: false,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      select: false,
    },
  },
  relations: {
    createdSources: {
      type: 'one-to-many',
      target: () => Source,
      inverseSide: 'createdBy',
    },
    updatedSources: {
      type: 'one-to-many',
      target: () => Source,
      inverseSide: 'updatedBy',
    },
    createdWords: {
      type: 'one-to-many',
      target: () => Word,
      inverseSide: 'createdBy',
    },
    updatedWords: {
      type: 'one-to-many',
      target: () => Word,
      inverseSide: 'updatedBy',
    },
    createdWordDetails: {
      type: 'one-to-many',
      target: () => WordDetail,
      inverseSide: 'createdBy',
    },
    updatedWordDetails: {
      type: 'one-to-many',
      target: () => WordDetail,
      inverseSide: 'updatedBy',
    },
    createdDefinitions: {
      type: 'one-to-many',
      target: () => Definition,
      inverseSide: 'createdBy',
    },
    updatedDefinitions: {
      type: 'one-to-many',
      target: () => Definition,
      inverseSide: 'updatedBy',
    },
    createdTranslations: {
      type: 'one-to-many',
      target: () => Translation,
      inverseSide: 'createdBy',
    },
    updatedTranslations: {
      type: 'one-to-many',
      target: () => Translation,
      inverseSide: 'updatedBy',
    },
  },
});

export const WordSchema = new EntitySchema<Word>({
  name: 'Word',
  tableName: 'word',
  target: Word,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    spelling: {
      type: 'text',
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    langDialect: {
      type: 'many-to-one',
      target: () => LangDialect,
      joinColumn: { name: 'lang_dialect_id' },
      inverseSide: 'words',
    },
    createdBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'created_by' },
      inverseSide: 'createdWords',
    },
    updatedBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'updated_by' },
      inverseSide: 'updatedWords',
    },
    spellingVariants: {
      type: 'one-to-many',
      target: () => SpellingVariant,
      inverseSide: 'word',
    },
    details: {
      type: 'one-to-many',
      target: () => WordDetail,
      inverseSide: 'word',
    },
  },
});

export const WordDetailSchema = new EntitySchema<WordDetail>({
  name: 'WordDetail',
  tableName: 'word_details',
  target: WordDetail,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    orderIdx: {
      name: 'order_idx',
      type: 'int',
      nullable: true,
    },
    inflection: {
      type: 'text',
      nullable: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    word: {
      type: 'many-to-one',
      target: () => Word,
      joinColumn: { name: 'word_id' },
      inverseSide: 'details',
    },
    langDialect: {
      type: 'many-to-one',
      target: () => LangDialect,
      joinColumn: { name: 'lang_dialect_id' },
      inverseSide: 'wordDetails',
    },
    source: {
      type: 'many-to-one',
      target: () => Source,
      joinColumn: { name: 'source_id' },
      inverseSide: 'wordDetails',
      nullable: true,
    },
    createdBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'created_by' },
      inverseSide: 'createdWordDetails',
    },
    updatedBy: {
      type: 'many-to-one',
      target: () => User,
      joinColumn: { name: 'updated_by' },
      inverseSide: 'updatedWordDetails',
    },
    definitions: {
      type: 'one-to-many',
      target: () => Definition,
      inverseSide: 'wordDetails',
    },
    examples: {
      type: 'many-to-many',
      target: () => Translation,
      joinTable: {
        name: 'word_details_example',
        joinColumn: { name: 'word_details_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'translation_id', referencedColumnName: 'id' },
      },
      cascade: false,
    },
  },
});
