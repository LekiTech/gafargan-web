import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Language } from './enums';
import type { Word } from './Word';
import type { WordDetail } from './WordDetail';
import type { SpellingVariant } from './SpellingVariant';

@Entity({ name: 'lang_dialect' })
export class LangDialect {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: Language,
    enumName: 'Language',
  })
  language!: Language;

  @Column({ type: 'text', unique: true })
  dialect!: string;

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

  @OneToMany('Word', 'langDialect')
  words!: Word[];

  @OneToMany('WordDetail', 'langDialect')
  wordDetails!: WordDetail[];

  @OneToMany('SpellingVariant', 'langDialect')
  spellingVariants!: SpellingVariant[];
}
