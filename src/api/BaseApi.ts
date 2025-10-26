import axios, { AxiosRequestConfig } from 'axios';

axios.defaults.withCredentials = true;

export type Options = AxiosRequestConfig<object>;

export default class BaseApi {
  private _baseUrl: string | undefined;
  private logEnabled = process.env.NODE_ENV === 'development';
  private headers: Record<string, any> = {};

  public get baseUrl() {
    return this._baseUrl;
  }

  constructor(baseUrl?: string) {
    this._baseUrl = baseUrl ?? process.env.API_URL;
    if (!this._baseUrl) {
      throw new Error('API_URL is not defined!');
    }
    this.log('[API] initialized with url: ' + this.baseUrl);
    this.log('[API] mode: ' + process.env.NODE_ENV);
  }

  protected log(...payload: any[]): void {
    if (this.logEnabled) {
      console.debug(...payload);
    }
  }

  protected createUrl(endpoint: string): string {
    this.log('[API] createUrl: baseUrl = ' + this.baseUrl);
    if (this.baseUrl) {
      const finalUrl = new URL(endpoint, this.baseUrl);
      return finalUrl.toString();
    } else {
      throw new Error('API_URL is not defined!');
    }
    // return `${customBaseUrl ?? this.baseUrl}${endpoint}`;
  }

  protected get(url: string, options?: Options) {
    const finalUrl = this.createUrl(url);
    const axiosOptions = this.mergeOptions(options);
    this.log('[API] GET: ' + finalUrl, axiosOptions);
    return axios.get(finalUrl, axiosOptions);
  }

  protected post(url: string, body: object, options?: Options) {
    const finalUrl = this.createUrl(url);
    const axiosOptions = this.mergeOptions(options);
    this.log('[API] POST: ' + finalUrl);
    return axios.post(finalUrl, body, axiosOptions);
  }

  protected put(url: string, body: object, options?: Options) {
    const finalUrl = this.createUrl(url);
    const axiosOptions = this.mergeOptions(options);
    this.log('[API] PUT: ' + finalUrl);
    return axios.put(finalUrl, body, axiosOptions);
  }

  protected patch(url: string, body: object, options?: Options) {
    const finalUrl = this.createUrl(url);
    const axiosOptions = this.mergeOptions(options);
    this.log('[API] PATCH: ' + finalUrl);
    return axios.patch(finalUrl, body, axiosOptions);
  }

  private mergeOptions(options?: Options): Options {
    return {
      // withCredentials: true,
      ...options,
      headers: options
        ? {
            ...this.headers,
            ...options.headers,
          }
        : this.headers,
    };
  }

  protected delete(url: string, body?: object, options?: Options) {
    const finalUrl = this.createUrl(url);
    const axiosOptions = this.mergeOptions(options);
    this.log('[API] DELETE: ' + finalUrl);
    if (body) {
      return axios.delete(finalUrl, { ...axiosOptions, data: body });
    }
    return axios.delete(finalUrl, axiosOptions);
    // return axios({
    //   ...axiosOptions,
    //   method: 'delete',
    //   url: this.createUrl(url),
    //   data: body,
    // });
  }
}
