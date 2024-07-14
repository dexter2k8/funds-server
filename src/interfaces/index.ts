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
  transactions?: ITransactionResponse[];
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
  fund_alias: string;
}

export interface ITransactionPatchRequest {
  value?: number;
  date?: Date;
  quantity?: number;
  income?: number;
  fund_alias?: string;
}

export interface ITransactionResponse extends ITransactionRequest {
  id: string;
  user_id?: string;
}
