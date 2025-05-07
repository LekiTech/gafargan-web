import { ProposalOperation, ProposalStatus } from './enums';
import { User } from './User';

export class Proposal {
  id!: number;

  tableName!: string;

  operation!: ProposalOperation;

  recordId!: number | null;

  newData!: Record<string, any> | null;

  oldData!: Record<string, any> | null;

  proposedBy!: User;
  proposedById!: number;

  proposedAt!: Date;

  status!: ProposalStatus;

  reviewedBy!: User | null;
  reviewedById!: number | null;

  reviewedAt!: Date | null;
}
