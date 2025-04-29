import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { LangDialect } from './LangDialect';
import { User } from './User';
import type { SpellingVariant } from './SpellingVariant';
import type { WordDetail } from './WordDetail';

@Entity({ name: 'word' })
export class Word {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  spelling!: string;

  @ManyToOne(() => LangDialect, (ld) => ld.words, { nullable: false })
  @JoinColumn({ name: 'lang_dialect_id' })
  langDialect!: LangDialect;

  @ManyToOne(() => User, (user) => user.createdWords, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @ManyToOne(() => User, (user) => user.updatedWords, { nullable: false })
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

  @OneToMany('SpellingVariant', 'word')
  spellingVariants!: SpellingVariant[];

  @OneToMany('WordDetail', 'word')
  details!: WordDetail[];
}
