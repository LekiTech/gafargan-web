import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity({ name: 'translations' })
export class Translation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'phrases_per_lang_dialect',
    type: 'jsonb',
  })
  phrasesPerLangDialect!: Record<string, TranslationPhrases>;

  @Column('text', { array: true })
  tags!: string[];

  @Column({ type: 'text', nullable: true })
  raw!: string | null;

  @ManyToOne(() => User, (user) => user.createdTranslations, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @ManyToOne(() => User, (user) => user.updatedTranslations, { nullable: false })
  @JoinColumn({ name: 'updated_by' })
  updatedBy!: User;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
//  For now this one is unnecessary complex, we can use the latter implementation without huge losses in UX
// export interface TranslationPhrases {
//   /**
//    * Here "phrase" is a word, phrase, or a sentence
//    * It is an array because there could be multiple ways to formulate the same meaning
//    */
//   phrases: { phrase: string; tags?: string[] }[];
//   tags?: string[];
// }
export interface TranslationPhrases {
  phrase: string;
  tags?: string[];
}
