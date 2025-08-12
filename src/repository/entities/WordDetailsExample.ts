import { WordDetail } from './WordDetail';
import { Translation } from './Translation';
import { User } from './User';

export class WordDetailsExample {
  wordDetailsId!: number;
  wordDetails!: WordDetail;

  translationId!: number;
  translation!: Translation;

  createdById!: number;
  createdBy!: User;

  createdAt!: Date;
}
