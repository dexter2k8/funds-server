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
  price: number;
  updated_at: Date;
  quantity: number;
  income?: number;
  fund_alias?: string;
}

export interface ITransactionPatchRequest {
  price?: number;
  updated_at?: Date;
  quantity?: number;
  income?: number;
  fund_alias?: string;
}

export interface ITransactionResponse extends ITransactionRequest {
  id: string;
  user_id?: string;
}
