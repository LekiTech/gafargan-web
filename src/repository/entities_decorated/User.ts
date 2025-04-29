// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Language, Role } from './enums';
import { Source } from './Source';
import { Word } from './Word';
import { WordDetail } from './WordDetail';
import { Definition } from './Definition';
import { Translation } from './Translation';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: true })
  name!: string | null;

  @Column({ type: 'text', unique: true, select: false })
  email!: string;

  @Column({ type: 'text', select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: Language,
    enumName: 'Language',
    nullable: true,
    select: false,
  })
  language!: Language | null;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    enumName: 'Role',
  })
  role!: Role;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    select: false,
  })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    select: false,
  })
  updatedAt!: Date;

  @OneToMany('Source', 'createdBy')
  createdSources!: Source[];
  @OneToMany('Source', 'updatedBy')
  updatedSources!: Source[];

  @OneToMany('Word', 'createdBy')
  createdWords!: Word[];
  @OneToMany('Word', 'updatedBy')
  updatedWords!: Word[];

  @OneToMany('WordDetail', 'createdBy')
  createdWordDetails!: WordDetail[];
  @OneToMany('WordDetail', 'updatedBy')
  updatedWordDetails!: WordDetail[];

  @OneToMany('Definition', 'createdBy')
  createdDefinitions!: Definition[];
  @OneToMany('Definition', 'updatedBy')
  updatedDefinitions!: Definition[];

  @OneToMany('Translation', 'createdBy')
  createdTranslations!: Translation[];
  @OneToMany('Translation', 'updatedBy')
  updatedTranslations!: Translation[];
}
