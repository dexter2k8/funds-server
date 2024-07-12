export interface IUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface IUserPatchRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IFundRequest {
  alias: string;
  name: string;
  description?: string;
  type: string;
  sector?: string;
}

export interface IFundResponse {
  id: string;
  alias: string;
  name: string;
  description?: string;
  type: string;
  sector?: string;
}
