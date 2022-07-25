import * as _fsx from 'fs-extra';
import fetch, { Response } from 'node-fetch';

export abstract class HttpService {

  constructor(private apiBaseUri: string) {

  }

  protected get<T = any>(uri: string, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    }
    return fetch(url, data).then(this.handleApiResponse);
  }

  protected post<T = any>(uri: string, body: any, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    }
    return fetch(url, data).then(this.handleApiResponse);
  }

  protected put<T = any>(uri: string, body: any, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    }
    return fetch(url, data).then(this.handleApiResponse);
  }

  protected delete<T = any>(uri: string, headers: any = {}): Promise<T> {
    let url = `${this.apiBaseUri}/${uri}`;
    let data = {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    }
    return fetch(url, data).then(this.handleApiResponse);
  }

  protected downloadFile(uri: string, outputPath: string): Promise<void> {
    return new Promise((res, err) => {
      let url = `${this.apiBaseUri}/${uri}`;
      fetch(url).then((response: Response) => {
        const fileStream = _fsx.createWriteStream(outputPath);
        response.body.pipe(fileStream);
        response.body.on("error", err);
        fileStream.on("finish", res);
      });
    });
  }

  // protected downloadTemplate(uri: string, headers: any = {}, outputPath: string): Promise<Template> {
  //   return new Promise((res, err) => {
  //     let url = `${this.apiBaseUri}/${uri}`;
  //     let data = {
  //       method: "GET",
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json',
  //         ...headers
  //       }
  //     }
  //     fetch(url, data).then((response: Response) => {
  //       console.dir(response);
  //       const fileStream = _fsx.createWriteStream('D:\\Downloads');
  //       response.body.pipe(fileStream);
  //       response.body.on("error", err);
  //       fileStream.on("finish", res);
  //     });
  //   });
  // }

  private handleApiResponse<T = any>(response: Response): Promise<T> {
    if (!response.ok) {
      console.dir(response)
      throw Error(response.statusText);
    }
    if (response.status === 202) return Promise.resolve(undefined);
    return response.json() as Promise<T>;
  }

}