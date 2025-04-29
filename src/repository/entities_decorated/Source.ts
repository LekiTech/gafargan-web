import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import type { WordDetail } from './WordDetail';

@Entity({ name: 'source' })
export class Source {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  authors!: string | null;

  @Column({ name: 'publication_year', type: 'text', nullable: true })
  publicationYear!: string | null;

  @Column({ name: 'provided_by', type: 'text', nullable: true })
  providedBy!: string | null;

  @Column({ name: 'provided_by_url', type: 'text', nullable: true })
  providedByUrl!: string | null;

  @Column({ name: 'processed_by', type: 'text', nullable: true })
  processedBy!: string | null;

  @Column({ type: 'text', nullable: true })
  copyright!: string | null;

  @Column({ name: 'see_source_url', type: 'text', nullable: true })
  seeSourceUrl!: string | null;

  @Column({ type: 'text', nullable: true, select: false })
  description!: string | null;

  @ManyToOne(() => User, (user) => user.createdSources, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @ManyToOne(() => User, (user) => user.updatedSources, { nullable: false })
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

  @OneToMany('WordDetail', 'source')
  wordDetails!: WordDetail[];
}
