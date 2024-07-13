export interface IUserRequest {
  name: string;
  email: string;
  password: string;
  admin: boolean;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  password?: string;
  admin?: boolean;
}

export interface IUserPatchRequest {
  name?: string;
  email?: string;
  password?: string;
  admin?: boolean;
}
export interface ISelfUserPatchRequest {
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

export interface IFundPatchRequest {
  alias?: string;
  name?: string;
  description?: string;
  type?: string;
  sector?: string;
}

export interface ITransactionRequest {
  value: number;
  date: Date;
  quantity: number;
  income?: number;
  fundAlias: string;
}

export interface ITransactionPatchRequest {
  value?: number;
  date?: Date;
  quantity?: number;
  income?: number;
  fundAlias?: string;
}

export interface ITransactionResponse extends ITransactionRequest {
  id: string;
  userId: string;
}
