"server-only";

import { Schema, z } from "zod";
import { notFound } from "next/navigation";
import { isNullLike } from "../utils";
import { auth } from "./authSQL";
import { UserSessionSchema } from "../types/zparams";

// change behavior on server side
Date.prototype.toJSON = function () {
  return this.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const customReplacer = (key: string, value: unknown) => {
  if (value === null) {
    return undefined; // remove null values!! to ensure serializability
  }
  return value; // return other values as is
};

type StrictPlain<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends Date
        ? string
        : T[K] extends null
        ? never // just dissapear null values
        : T[K] extends object
        ? StrictPlain<T[K]>
        : T[K];
    } extends infer U
    ? { [K in keyof U as U[K] extends never ? never : K]: U[K] }
    : never
  : T extends null
  ? undefined
  : T;

export const convertToPlainObj = <T>(data: T): StrictPlain<T> => {
  if (isNullLike(data)) return undefined as StrictPlain<T>;
  return JSON.parse(JSON.stringify(data, customReplacer));
};

type InferArgs<T extends readonly Schema[]> = {
  [K in keyof T]: z.infer<T[K]>;
};

type UnknownArgs<T extends readonly Schema[]> = {
  [K in keyof T]: unknown;
};

const processClientWorkload = <const TSchema extends Schema>(
  params: unknown,
  validator: TSchema
): z.infer<TSchema> => {
  const validation = validator.safeParse(params);
  if (!validation.success) {
    throw new Error("非法参数： " + validation.error.message);
  }
  return validation.data;
};

export type ActionResponseSuccess<T> = {
  success: true;
  data: T;
};

export type ActionResponseError = {
  success: false;
  msg: string;
};

export type ActionResponse<T> = ActionResponseSuccess<T> | ActionResponseError;

// all server action need to be authenticated, except query
export function buildServerAction<
  TOutput,
  const TSchemas extends readonly Schema[]
>(
  schemas: TSchemas,
  dbcore: (...args: InferArgs<TSchemas>) => Promise<TOutput>,
  isQuery: boolean = false
): (
  ...unkown_args: UnknownArgs<TSchemas>
) => Promise<ActionResponse<StrictPlain<TOutput>>> {
  return async (...unkown_args) => {
    try {
      // Validate arguments (throws on error)
      if (unkown_args.length !== schemas.length) {
        throw new Error(
          `需要 ${schemas.length} 个参数, 但只传递了 ${unkown_args.length}.`
        );
      }
      const parsedArgs = schemas.map((schema, index) =>
        processClientWorkload(unkown_args[index], schema)
      );
      
      const result = await dbcore(...(parsedArgs as InferArgs<TSchemas>));
      const plain = convertToPlainObj(result); // ensure result is serializable
      
      return { success: true as const, data: plain };

    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("DEBUG:", err);
      if (isQuery) notFound();
      return {
        success: false,
        msg: err instanceof Error ? err.message : "服务调用失败！",
      };
    }
  };
}

// for query or mutation, if query it is ok to return 404 if validation failed
// most query do not need auth
export function buildServerQuery<
  TOutput,
  const TSchemas extends readonly Schema[]
>(
  schemas: TSchemas,
  dbcore: (...args: InferArgs<TSchemas>) => Promise<TOutput>
): (
  ...unkown_args: UnknownArgs<TSchemas>
) => Promise<NonNullable<StrictPlain<TOutput>>> {
  return (...unkown_args) =>
    buildServerAction(
      schemas,
      dbcore,
      true
    )(...unkown_args).then((actionRes) => {
      // for success query, there should not be undefined values
      if (actionRes.success && actionRes.data) {
        return actionRes.data;
      } else {
        return notFound(); // if failed, return 404
      }
    });
}

// return current user in the session.
export async function authProtectedModule(isAdmin: boolean) {
  // if isQuery, do not need auth
  const session = await auth();
  // console.log("SESSION: ", session);
  if (!session || !session.user) { // do not need to check expire, auth() auto handle this
    throw new Error("请先登录！");
  }
  if (isAdmin && !session.user.isAdmin) {
    throw new Error("没有管理权限！");
  }
  return processClientWorkload(session.user, UserSessionSchema);
}
