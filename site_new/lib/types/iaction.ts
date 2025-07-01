export type ActionResponseSuccess<T> = {
  success: true;
  data: T;
};

export type ActionResponseError = {
  success: false;
  msg: string;
};

export type ActionResponse<T> = ActionResponseSuccess<T> | ActionResponseError;

