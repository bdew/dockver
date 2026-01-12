import { AuthRequest } from "./headers";

export const ResponseStatusOk = Symbol("OK");
export const ResponseStatusUnauthorized = Symbol("Unauthorized");

export interface ResponseOk<T> {
  status: typeof ResponseStatusOk;
  response: T;
  headers: Headers;
}

export interface ResponseUnauthorized {
  status: typeof ResponseStatusUnauthorized;
  request: AuthRequest;
}

export type Response<T> = ResponseOk<T> | ResponseUnauthorized;

export interface TokenResponse {
  token: string;
}

export interface RepoAuthBasic {
  user: string;
  pass: string;
}

export interface TagsResponse {
  name: string;
  tags: string[];
}
