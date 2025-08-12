import { Definition } from './Definition';
import { Translation } from './Translation';
import { User } from './User';

export class DefinitionExample {
  definitionId!: number;
  definition!: Definition;

  translationId!: number;
  translation!: Translation;

  createdById!: number;
  createdBy!: User;

  createdAt!: Date;
}
