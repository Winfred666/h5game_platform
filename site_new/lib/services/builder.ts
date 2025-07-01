"server-only";

import { Schema, z } from "zod";
import { ActionResponse } from "../types/iaction";
import { notFound } from "next/navigation";
import { isNullLike } from "../utils";


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

const customReplacer = (key: string, value: any) => {
  if (value === null) {
    return undefined; // remove null values!! to ensure serializability
  }
  return value; // return other values as is
};


type StrictPlain<T> =
T extends object ? ({
  [K in keyof T]: 
    T[K] extends Date ? string :
    T[K] extends null ? never :  // just dissapear null values
    T[K] extends object ? StrictPlain<T[K]> :
    T[K]
} extends infer U 
  ? { [K in keyof U as U[K] extends never ? never : K]: U[K] }
  : never) : T extends null ? undefined : T;

export const convertToPlainObj = <T>(data: T): StrictPlain<T> =>{
  if(isNullLike(data)) return undefined as StrictPlain<T>;
  return JSON.parse(JSON.stringify(data, customReplacer));
}

type InferArgs<T extends readonly Schema[]> = {
  [K in keyof T]: z.infer<T[K]>;
};

type UnknownArgs<T extends readonly Schema[]> = {
  [K in keyof T]: unknown;
};

export const processClientWorkload = <const TSchema extends Schema>(
  params: unknown,
  validator: TSchema,
  reject: (reason?: any) => void
): z.infer<TSchema> => {
  const validation = validator.safeParse(params);
  if (!validation.success) {
    reject("Invalid parameters: " + validation.error.message);
  }
  return validation.data;
};

export function buildServerAction<
  TOutput,
  const TSchemas extends readonly Schema[]
>(
  schemas: TSchemas,
  dbcore: (...args: InferArgs<TSchemas>) => Promise<TOutput>,
  isQuery: boolean = false
): (...unkown_args: UnknownArgs<TSchemas>) => Promise<ActionResponse<StrictPlain<TOutput>>> {
  return async (...unkown_args) =>
    new Promise((resolve, reject) => {
      if (unkown_args.length !== schemas.length) {
        reject(
          new Error(
            `Expected ${schemas.length} arguments, but got ${unkown_args.length}.`
          )
        );
      }
      resolve(
        schemas.map((schema, index) =>
          processClientWorkload(unkown_args[index], schema, reject)
        )
      );
    })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") console.error("DEBUG:",err);
        if (isQuery) notFound();
        return { success: false, msg: "参数验证失败！请检查输入数据格式。" };
      })
      .then((parsedArgs) => {
        return dbcore(...(parsedArgs as InferArgs<TSchemas>));
      })
      .then((result) => {
        const plain = convertToPlainObj(result); // ensure result is serializable
        return { success: true as const, data: plain };
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") console.error("DEBUG:",err);
        return { success: false, msg: err instanceof Error ? err.message : "数据处理错误！" };
      });
}

// for query or mutation, if query it is ok to return 404 if validation failed

export function buildServerQuery<
  TOutput,
  const TSchemas extends readonly Schema[]
>(
  schemas: TSchemas,
  dbcore: (...args: InferArgs<TSchemas>) => Promise<TOutput>
): (...unkown_args: UnknownArgs<TSchemas>) => Promise<StrictPlain<TOutput>> {
  return (...unkown_args) =>
    buildServerAction(schemas, dbcore, true)(...unkown_args).then(actionRes=> {
      if (actionRes.success) {
        return actionRes.data;
      } else {
        notFound(); // if failed, return 404
      }
    });
}
