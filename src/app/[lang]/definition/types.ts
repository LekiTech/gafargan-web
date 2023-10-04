export type Contents = {
  /** Pure visual ID for UI purposes */
  spellingId: string;
  spelling: string;
  inflection?: string;
  details: {
    /** Pure visual ID for UI purposes */
    detailsId: string;
    definitionsCount: number;
    examplesCount: number;
    preview: string;
  }[];
  /** Pure visual ID for UI purposes */
  otherExamplesId: string;
  otherExamplesCount: number;
};
