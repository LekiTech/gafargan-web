import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Word } from './Word';
import { LangDialect } from './LangDialect';

@Entity({ name: 'spelling_variant' })
export class SpellingVariant {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => LangDialect, (ld) => ld.spellingVariants, { nullable: true })
  @JoinColumn({ name: 'lang_dialect_id' })
  langDialect!: LangDialect | null;

  @ManyToOne(() => Word, (word) => word.spellingVariants, { nullable: false })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  @Column({ type: 'text' })
  spelling!: string;

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
