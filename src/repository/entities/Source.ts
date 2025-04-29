import { User } from './User';
import type { WordDetail } from './WordDetail';

export class Source {
  id!: number;

  name!: string;

  authors!: string | null;

  publicationYear!: string | null;

  providedBy!: string | null;

  providedByUrl!: string | null;

  processedBy!: string | null;

  copyright!: string | null;

  seeSourceUrl!: string | null;

  description!: string | null;

  createdBy!: User;

  updatedBy!: User;

  createdAt!: Date;

  updatedAt!: Date;

  wordDetails!: WordDetail[];
}
