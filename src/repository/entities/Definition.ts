import { WordDetail } from './WordDetail';
import { User } from './User';
import { Translation } from './Translation';

export class Definition {
  id!: number;

  wordDetailsId!: number;
  wordDetails!: WordDetail | null;

  values!: DefinitionValue[];

  tags!: string[];

  createdById!: number;
  createdBy!: User;

  updatedById!: number;
  updatedBy!: User;
  createdAt!: Date;
  updatedAt!: Date;
  examples!: Translation[];
}

export interface DefinitionValue {
  value: string;
  tags?: string[];
}
