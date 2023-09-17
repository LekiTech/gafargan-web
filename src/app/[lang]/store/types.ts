export type Example = { raw: string; src?: string; trl?: string; tags?: string[] };

export type DefinitionDetails = {
  definitions: {
    value: string;
    tags?: string[];
  }[];
  examples?: Example[];
  /** tags applicable to all `definitions` and `examples` */
  tags?: string[];
};

export type ExpressionDetails = {
  // grammatical forms of the expression
  gr?: string;
  inflection?: string;
  definitionDetails: DefinitionDetails[];
  examples?: Example[];
};

export type Expression = {
  spelling: string;
  details: ExpressionDetails[];
};


export type Dictionary = {
  name: string;
  authors?: string;
  publicationYear?: string;
  description?: string;
  providedBy?: string;
  providedByURL?: string;
  processedBy?: string;
  copyright?: string;
  seeSourceURL?: string;
  expressionLanguageId: string;
  definitionLanguageId: string;
  expressions: Expression[];
};