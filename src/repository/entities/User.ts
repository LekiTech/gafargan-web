// src/entities/User.ts
import { Language, Role } from './enums';
import { Source } from './Source';
import { Word } from './Word';
import { WordDetail } from './WordDetail';
import { Definition } from './Definition';
import { Translation } from './Translation';

export class User {
  id!: number;

  name!: string | null;

  email!: string;

  password!: string;

  language!: Language | null;

  verified!: boolean;

  role!: Role;

  createdAt!: Date;

  updatedAt!: Date;

  createdSources!: Source[];
  updatedSources!: Source[];

  createdWords!: Word[];
  updatedWords!: Word[];

  createdWordDetails!: WordDetail[];
  updatedWordDetails!: WordDetail[];

  createdDefinitions!: Definition[];
  updatedDefinitions!: Definition[];

  createdTranslations!: Translation[];
  updatedTranslations!: Translation[];
}
