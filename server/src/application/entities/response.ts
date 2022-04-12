import { IError } from ".";

export type IResSuccess<T> = {
  success: true;
  data: T;
};

export class ResSuccess<T> implements IResSuccess<T> {
  public success: true = true;
  constructor(public data: T) {}
}

export type IResFailure = {
  success: false;
  error: IError;
};

export class ResFailure implements IResFailure {
  public success: false = false;
  constructor(public error: IError) {}
}

export type IRes<T> = IResSuccess<T> | IResFailure;
