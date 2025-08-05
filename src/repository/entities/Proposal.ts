import { ProposalType, ProposalStatus } from './enums';
import { User } from './User';

export class Proposal {
  id!: number;

  type!: ProposalType;

  data!: Record<string, any> | null;

  proposedBy!: User;
  proposedById!: number;

  proposedAt!: Date;

  status!: ProposalStatus;

  comment!: string;

  reviewedBy!: User | null;
  reviewedById!: number | null;

  reviewedAt!: Date | null;
}
