import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Word } from './Word';
import { LangDialect } from './LangDialect';
import { Source } from './Source';
import { User } from './User';
import type { Definition } from './Definition';
import { Translation } from './Translation';

@Entity({ name: 'word_details' })
export class WordDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Word, (w) => w.details, { nullable: false })
  @JoinColumn({ name: 'word_id' })
  word!: Word;

  @Column({ name: 'order_idx', type: 'int', nullable: true })
  orderIdx!: number | null;

  @Column({ type: 'text', nullable: true })
  inflection!: string | null;

  @ManyToOne(() => LangDialect, (ld) => ld.wordDetails, { nullable: false })
  @JoinColumn({ name: 'lang_dialect_id' })
  langDialect!: LangDialect;

  @ManyToOne(() => Source, (source) => source.wordDetails, { nullable: true })
  @JoinColumn({ name: 'source_id' })
  source!: Source | null;

  @ManyToOne(() => User, (user) => user.createdWordDetails, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @ManyToOne(() => User, (user) => user.updatedWordDetails, { nullable: false })
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

  @OneToMany('Definition', 'wordDetails')
  definitions!: Definition[];

  @ManyToMany(() => Translation, { cascade: false })
  @JoinTable({
    name: 'word_details_example',
    joinColumn: { name: 'word_details_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'translation_id', referencedColumnName: 'id' },
  })
  examples!: Translation[];
}
