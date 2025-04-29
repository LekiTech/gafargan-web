import { WordDetail } from './WordDetail';
import { User } from './User';
import { Translation } from './Translation';

export class Definition {
  id!: number;

  wordDetails!: WordDetail | null;

  values!: DefinitionValue[];

  tags!: string[];

  createdBy!: User;

  updatedBy!: User;
  createdAt!: Date;
  updatedAt!: Date;
  examples!: Translation[];
}

export interface DefinitionValue {
  value: string;
  tags?: string[];
}
