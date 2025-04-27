import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { WordDetail } from './WordDetail';
import { User } from './User';
import { Translation } from './Translation';

@Entity({ name: 'definition' })
export class Definition {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => WordDetail, (wd) => wd.definitions, { nullable: true })
  @JoinColumn({ name: 'word_details_id' })
  wordDetails!: WordDetail | null;

  @Column('json', { array: true })
  values!: any[];

  @Column('text', { array: true })
  tags!: string[];

  @ManyToOne(() => User, (user) => user.createdDefinitions, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @ManyToOne(() => User, (user) => user.updatedDefinitions, { nullable: false })
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

  @ManyToMany(() => Translation, { cascade: false })
  @JoinTable({
    name: 'definition_example',
    joinColumn: { name: 'definition_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'translation_id', referencedColumnName: 'id' },
  })
  examples!: Translation[];
}
