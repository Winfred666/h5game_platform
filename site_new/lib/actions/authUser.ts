"use server";

import { signIn } from "@/lib/services/authSQL";
import { buildServerAction } from "../services/builder";
import { StringSchema } from "../types/zparams";
import { z } from "zod";

export const userLoginAction = buildServerAction(
  [StringSchema, z.instanceof(FormData)], // no transform and parse to object.
  signIn
);
