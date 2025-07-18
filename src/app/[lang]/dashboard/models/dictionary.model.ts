export const STATE = Object.freeze({
  UNCHANGED: 'unchanged',
  ADDED: 'added',
  MODIFIED: 'modified',
  DELETED: 'deleted',
});

export type StateType = (typeof STATE)[keyof typeof STATE];

abstract class Model {
  protected state: StateType;
  protected id?: number;
  constructor(state: StateType, id?: number) {
    this.state = state;
    if (state === STATE.UNCHANGED) {
      this.id = id;
    }
  }

  getState(): StateType {
    return this.state;
  }

  getId(): number | undefined {
    return this.id;
  }

  setModified(): void {
    if (this.state !== STATE.ADDED) {
      this.state = STATE.MODIFIED;
    }
  }

  delete(): void {
    this.state = STATE.DELETED;
  }

  abstract isEmpty(): boolean;
}

// ============== TranslationModel ==============

export type TranslationModelType =
  | {
      state: 'added';
      src: string;
      trl: string;
      tags?: string[];
    }
  | {
      state: 'unchanged' | 'modified' | 'deleted';
      id: number;
      src: string;
      trl: string;
      tags?: string[];
    };

export class TranslationModel extends Model {
  private src: string;
  private trl: string;
  private tags?: string[];
  constructor(data: TranslationModelType) {
    super(data.state, data.state === 'unchanged' ? data.id : undefined);
    this.src = data.src;
    this.trl = data.trl;
    this.tags = data.tags;
  }

  getSrc(): string {
    return this.src;
  }
  getTrl(): string {
    return this.trl;
  }
  getTags(): string[] | undefined {
    return this.tags;
  }
  setSrc(src: string): void {
    this.src = src;
    this.setModified();
  }
  setTrl(trl: string): void {
    this.trl = trl;
    this.setModified();
  }
  setTags(tags: string[] | undefined): void {
    this.tags = tags;
    this.setModified();
  }

  /**
   * Merges partial data into the TranslationModel instance in-place. It does not create a new instance.
   * This method updates the src, trl, and tags properties based on the provided data.
   * If the model is in 'added' state, it will update the src, trl, and tags properties.
   * If the model is in 'unchanged' state, it will update the src, trl, and tags properties
   * and set the state to 'modified'.
   *
   * @param data Partial data to merge into the model.
   * @returns The updated TranslationModel instance.
   */
  merge(data: Partial<TranslationModelType>): TranslationModel {
    this.setModified();
    if (data.src) {
      this.src = data.src;
    }
    if (data.trl) {
      this.trl = data.trl;
    }
    if (data.tags) {
      this.tags = data.tags;
    }
    return this;
  }

  getCopy(): TranslationModel {
    if (this.state === STATE.ADDED) {
      return new TranslationModel({
        state: this.state,
        src: this.src,
        trl: this.trl,
        tags: this.tags,
      });
    }
    return new TranslationModel({
      state: this.state,
      id: this.id!,
      src: this.src,
      trl: this.trl,
      tags: this.tags,
    });
  }

  isEmpty(): boolean {
    return (
      this.src.trim() === '' && this.trl.trim() === '' && (!this.tags || this.tags.length === 0)
    );
  }
}

// ============== DefinitionModel ==============

export type DefinitionModelType =
  | {
      state: 'added';
      value: string;
      tags?: string[];
      examples?: TranslationModel[];
    }
  | {
      state: 'unchanged' | 'modified' | 'deleted';
      id: number;
      value: string;
      tags?: string[];
      examples?: TranslationModel[];
    };

export class DefinitionModel extends Model {
  private value: string;
  private tags?: string[];
  private examples?: TranslationModel[];

  constructor(data: DefinitionModelType) {
    super(data.state, data.state === 'unchanged' ? data.id : undefined);
    this.value = data.value;
    this.tags = data.tags;
    this.examples = data.examples;
  }

  getValue(): string {
    return this.value;
  }

  getTags(): string[] | undefined {
    return this.tags;
  }

  getExamples(): TranslationModel[] | undefined {
    return this.examples;
  }

  setValue(value: string): void {
    this.value = value;
    this.setModified();
  }

  setTags(tags: string[] | undefined): void {
    this.tags = tags;
    this.setModified();
  }

  setExamples(examples: TranslationModel[] | undefined): void {
    this.examples = examples;
    this.setModified();
  }

  /**
   * Merges partial data into the DefinitionModel instance in-place. It does not create a new instance.
   * This method updates the value, tags, and examples properties based on the provided data.
   * If the model is in 'added' state, it will update the value, tags, and examples properties.
   * If the model is in 'unchanged' state, it will update the value, tags, and examples properties
   * and set the state to 'modified'.
   *
   * @param data Partial data to merge into the model.
   * @returns The updated DefinitionModel instance.
   */
  merge(data: Partial<DefinitionModelType>): DefinitionModel {
    this.setModified();
    if (data.value) {
      this.value = data.value;
    }
    if (data.tags) {
      this.tags = data.tags;
    }
    if (data.examples) {
      this.examples = data.examples;
    }
    return this;
  }

  getCopy(): DefinitionModel {
    if (this.state === STATE.ADDED) {
      return new DefinitionModel({
        state: this.state,
        value: this.value,
        tags: this.tags,
        examples: this.examples?.map((e) => e.getCopy()),
      });
    }
    return new DefinitionModel({
      state: this.state,
      id: this.id!,
      value: this.value,
      tags: this.tags,
      examples: this.examples?.map((e) => e.getCopy()),
    });
  }

  isEmpty(): boolean {
    return (
      this.value.trim() === '' &&
      (!this.tags || this.tags.length === 0) &&
      (!this.examples || this.examples.length === 0 || this.examples.every((e) => e.isEmpty()))
    );
  }
}

// ============== WordDetailModel ==============

export type WordDetailModelType =
  | {
      state: 'added';
      inflection?: string;
      tags?: string[];
      definitions: DefinitionModel[];
      examples?: TranslationModel[];
    }
  | {
      state: 'unchanged' | 'modified' | 'deleted';
      id: number;
      inflection?: string;
      tags?: string[];
      definitions: DefinitionModel[];
      examples?: TranslationModel[];
    };

export class WordDetailModel extends Model {
  private inflection?: string;
  private tags?: string[];
  private definitions: DefinitionModel[];
  private examples?: TranslationModel[];

  constructor(data: WordDetailModelType) {
    super(data.state, data.state === 'unchanged' ? data.id : undefined);
    this.inflection = data.inflection;
    this.tags = data.tags;
    this.definitions = data.definitions;
    this.examples = data.examples;
  }
  getInflection(): string | undefined {
    return this.inflection;
  }
  getTags(): string[] | undefined {
    return this.tags;
  }
  getDefinitions(): DefinitionModel[] {
    return this.definitions;
  }
  getExamples(): TranslationModel[] | undefined {
    return this.examples;
  }
  setInflection(inflection: string | undefined): void {
    this.inflection = inflection;
    this.setModified();
  }
  setTags(tags: string[] | undefined): void {
    this.tags = tags;
    this.setModified();
  }
  setDefinitions(definitions: DefinitionModel[]): void {
    this.definitions = definitions;
    this.setModified();
  }
  setExamples(examples: TranslationModel[] | undefined): void {
    this.examples = examples;
    this.setModified();
  }

  /**
   * Merges partial data into the WordDetailModel instance in-place. It does not create a new instance.
   * This method updates the inflection, tags, definitions, and examples properties based on the provided data.
   * If the model is in 'added' state, it will update the inflection, tags, definitions, and examples properties.
   * If the model is in 'unchanged' state, it will update the inflection, tags, definitions, and examples properties
   * and set the state to 'modified'.
   *
   * @param data Partial data to merge into the model.
   * @returns The updated WordDetailModel instance.
   */
  merge(data: Partial<WordDetailModelType>): WordDetailModel {
    this.setModified();
    if (data.inflection) {
      this.inflection = data.inflection;
    }
    if (data.tags) {
      this.tags = data.tags;
    }
    if (data.definitions) {
      this.definitions = data.definitions;
    }
    if (data.examples) {
      this.examples = data.examples;
    }
    return this;
  }

  getCopy(): WordDetailModel {
    if (this.state === STATE.ADDED) {
      return new WordDetailModel({
        state: this.state,
        inflection: this.inflection,
        tags: this.tags,
        definitions: this.definitions.map((d) => d.getCopy()),
        examples: this.examples?.map((e) => e.getCopy()),
      });
    }
    return new WordDetailModel({
      state: this.state,
      id: this.id!,
      inflection: this.inflection,
      tags: this.tags,
      definitions: this.definitions.map((d) => d.getCopy()),
      examples: this.examples?.map((e) => e.getCopy()),
    });
  }

  isEmpty(): boolean {
    return (
      (!this.inflection || this.inflection.trim() === '') &&
      (!this.tags || this.tags.length === 0) &&
      (!this.definitions ||
        this.definitions.length === 0 ||
        this.definitions.every((d) => d.isEmpty())) &&
      (!this.examples || this.examples.length === 0 || this.examples.every((e) => e.isEmpty()))
    );
  }
}

// ============== WordModel ==============

export type WordModelType =
  | {
      state: 'added';
      spelling: string;
      wordDetails: WordDetailModel[];
    }
  | {
      state: 'unchanged' | 'modified' | 'deleted';
      id: number;
      spelling: string;
      wordDetails: WordDetailModel[];
    };

export class WordModel extends Model {
  private spelling: string;
  private wordDetails: WordDetailModel[];
  constructor(data: WordModelType) {
    super(data.state, data.state === 'unchanged' ? data.id : undefined);
    this.spelling = data.spelling;
    this.wordDetails = data.wordDetails;
  }

  getSpelling(): string {
    return this.spelling;
  }
  getWordDetails(): WordDetailModel[] {
    return this.wordDetails;
  }
  setSpelling(spelling: string): void {
    this.spelling = spelling;
    this.setModified();
  }
  setWordDetails(wordDetails: WordDetailModel[]): void {
    this.wordDetails = wordDetails;
    this.setModified();
  }

  /**
   * Merges partial data into the WordModel instance in-place. It does not create a new instance.
   * This method updates the spelling and wordDetails properties based on the provided data.
   * If the model is in 'added' state, it will update the spelling and wordDetails properties.
   * If the model is in 'unchanged' state, it will update the spelling and wordDetails properties
   * and set the state to 'modified'.
   *
   * @param data Partial data to merge into the model.
   * @returns The updated WordModel instance.
   */
  merge(data: Partial<WordModelType>): WordModel {
    this.setModified();
    if (data.spelling) {
      this.spelling = data.spelling;
    }
    if (data.wordDetails) {
      this.wordDetails = data.wordDetails;
    }
    return this;
  }

  getCopy(): WordModel {
    if (this.state === STATE.ADDED) {
      return new WordModel({
        state: this.state,
        spelling: this.spelling,
        wordDetails: this.wordDetails.map((wd) => wd.getCopy()),
      });
    }
    return new WordModel({
      state: this.state,
      id: this.id!,
      spelling: this.spelling,
      wordDetails: this.wordDetails.map((wd) => wd.getCopy()),
    });
  }

  isEmpty(): boolean {
    return (
      this.spelling.trim() === '' &&
      (!this.wordDetails ||
        this.wordDetails.length === 0 ||
        this.wordDetails.every((wd) => wd.isEmpty()))
    );
  }
}

// ============== SourceModel ==============

export type SourceModelType =
  | {
      state: 'added';
      name: string;
      authors?: string;
      publicationYear?: string;
      providedBy?: string;
      providedByUrl?: string;
      processedBy?: string;
      copyright?: string;
      seeSourceUrl?: string;
      description?: string;
    }
  | {
      state: 'unchanged' | 'modified' | 'deleted';
      id: number;
      name: string;
      authors?: string;
      publicationYear?: string;
      providedBy?: string;
      providedByUrl?: string;
      processedBy?: string;
      copyright?: string;
      seeSourceUrl?: string;
      description?: string;
    };

export class SourceModel extends Model {
  private name: string;
  private authors?: string;
  private publicationYear?: string;
  private providedBy?: string;
  private providedByUrl?: string;
  private processedBy?: string;
  private copyright?: string;
  private seeSourceUrl?: string;
  private description?: string;

  constructor(data: SourceModelType) {
    super(data.state, data.state === 'unchanged' ? data.id : undefined);
    this.name = data.name;
    this.authors = data.authors;
    this.publicationYear = data.publicationYear;
    this.providedBy = data.providedBy;
    this.providedByUrl = data.providedByUrl;
    this.processedBy = data.processedBy;
    this.copyright = data.copyright;
    this.seeSourceUrl = data.seeSourceUrl;
    this.description = data.description;
  }
  getName(): string {
    return this.name;
  }
  getAuthors(): string | undefined {
    return this.authors;
  }
  getPublicationYear(): string | undefined {
    return this.publicationYear;
  }
  getProvidedBy(): string | undefined {
    return this.providedBy;
  }
  getProvidedByUrl(): string | undefined {
    return this.providedByUrl;
  }
  getProcessedBy(): string | undefined {
    return this.processedBy;
  }
  getCopyright(): string | undefined {
    return this.copyright;
  }
  getSeeSourceUrl(): string | undefined {
    return this.seeSourceUrl;
  }
  getDescription(): string | undefined {
    return this.description;
  }

  setName(name: string): void {
    this.name = name;
    this.setModified();
  }
  setAuthors(authors: string | undefined): void {
    this.authors = authors;
    this.setModified();
  }
  setPublicationYear(publicationYear: string | undefined): void {
    this.publicationYear = publicationYear;
    this.setModified();
  }
  setProvidedBy(providedBy: string | undefined): void {
    this.providedBy = providedBy;
    this.setModified();
  }
  setProvidedByUrl(providedByUrl: string | undefined): void {
    this.providedByUrl = providedByUrl;
    this.setModified();
  }
  setProcessedBy(processedBy: string | undefined): void {
    this.processedBy = processedBy;
    this.setModified();
  }
  setCopyright(copyright: string | undefined): void {
    this.copyright = copyright;
    this.setModified();
  }
  setSeeSourceUrl(seeSourceUrl: string | undefined): void {
    this.seeSourceUrl = seeSourceUrl;
    this.setModified();
  }
  setDescription(description: string | undefined): void {
    this.description = description;
    this.setModified();
  }

  /**
   * Merges partial data into the SourceModel instance in-place. It does not create a new instance.
   * This method updates the name, authors, publicationYear, providedBy, providedByUrl,
   * processedBy, copyright, seeSourceUrl, and description properties based on the provided data.
   * If the model is in 'added' state, it will update these properties.
   * If the model is in 'unchanged' state, it will update these properties
   * and set the state to 'modified'.
   *
   * @param data Partial data to merge into the model.
   * @returns The updated SourceModel instance.
   */
  merge(data: Partial<SourceModelType>): SourceModel {
    this.setModified();
    if (data.name) {
      this.name = data.name;
    }
    if (data.authors) {
      this.authors = data.authors;
    }
    if (data.publicationYear) {
      this.publicationYear = data.publicationYear;
    }
    if (data.providedBy) {
      this.providedBy = data.providedBy;
    }
    if (data.providedByUrl) {
      this.providedByUrl = data.providedByUrl;
    }
    if (data.processedBy) {
      this.processedBy = data.processedBy;
    }
    if (data.copyright) {
      this.copyright = data.copyright;
    }
    if (data.seeSourceUrl) {
      this.seeSourceUrl = data.seeSourceUrl;
    }
    if (data.description) {
      this.description = data.description;
    }
    return this;
  }

  getCopy(): SourceModel {
    if (this.state === STATE.ADDED) {
      return new SourceModel({
        state: this.state,
        name: this.name,
        authors: this.authors,
        publicationYear: this.publicationYear,
        providedBy: this.providedBy,
        providedByUrl: this.providedByUrl,
        processedBy: this.processedBy,
      });
    }
    return new SourceModel({
      state: this.state,
      id: this.id!,
      name: this.name,
      authors: this.authors,
      publicationYear: this.publicationYear,
      providedBy: this.providedBy,
      providedByUrl: this.providedByUrl,
      processedBy: this.processedBy,
    });
  }

  isEmpty(): boolean {
    return (
      this.name.trim() === '' &&
      (!this.authors || this.authors.trim() === '') &&
      this.publicationYear === undefined &&
      (!this.providedBy || this.providedBy.trim() === '') &&
      (!this.providedByUrl || this.providedByUrl.trim() === '') &&
      (!this.processedBy || this.processedBy.trim() === '') &&
      (!this.copyright || this.copyright.trim() === '') &&
      (!this.seeSourceUrl || this.seeSourceUrl.trim() === '') &&
      (!this.description || this.description.trim() === '')
    );
  }
}

// ============== DictionaryModel ==============

export class DictionaryModel {
  readonly version = 'V3';
  readonly entries: WordModel[];
  readonly source: SourceModel;

  constructor(entries: WordModel[], source: SourceModel) {
    this.entries = entries;
    this.source = source;
  }
}
