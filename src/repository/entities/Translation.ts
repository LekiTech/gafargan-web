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
  phrasesPerLangDialect!: Record<string, any>;

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
