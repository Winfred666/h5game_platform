import "server-only";

import { z } from "zod";

import { generateAssetsType } from "../dbInitUtils";
import {
  GameFormInputSchema,
  GameFormInputType,
  IncreGameFormInputSchema,
  UserUpdateFormInputSchema,
} from "./zformClient";
import { formDataToObject } from "../utils";
import { BooleanSchema, IDSchema, NameSchema, QQSchema, URLSchema } from "./zparams";

const serverGameTransform = (form: GameFormInputType) => {
  const assetsMode = form.kind === "html" ? form.embed_op : form.kind;
  if (assetsMode === "") throw new Error("游戏类型填写不完整");

  let assetsConfig;
  if (assetsMode === "fullscreen") {
    assetsConfig = {
      mode: "fullscreen" as const,
      useSharedArrayBuffer: form.useSharedArrayBuffer,
    };
  } else if (assetsMode === "embed") {
    assetsConfig = {
      mode: "embed" as const,
      useSharedArrayBuffer: form.useSharedArrayBuffer,
      width: parseInt(form.width),
      height: parseInt(form.height),
      isAutoStarted: form.isAutoStarted,
      hasFullscreenButton: form.hasFullscreenButton,
      enableScrollbars: form.enableScrollbars,
    };
  } else if (assetsMode === "jump") {
    assetsConfig = { mode: "jump" as const, url: form.jumpUrl };
  } else {
    assetsConfig = { mode: "downloadable" as const };
  }

  return {
    ...form,
    assetsType: generateAssetsType(assetsConfig),
    kind: undefined,
    embed_op: undefined,
    width: undefined,
    height: undefined,
    jumpUrl: undefined,

    isAutoStarted: undefined,
    useSharedArrayBuffer: undefined,
    enableScrollbars: undefined,
    hasFullscreenButton: undefined,
    developers: form.developers.map((dev: { id: string }) => ({
      id: dev.id,
    })),
    tags: form.tags.map((tagId: string) => ({ id: tagId })),
  };
};

// transform is available in ServerSchema ; and any preprocess should only write in serverSchema to do server-side validtaion.
export const GameFormServerSchema = z
  .instanceof(FormData)
  .transform(formDataToObject)
  .pipe(GameFormInputSchema.transform(serverGameTransform));

export const IncreGameFormServerSchema = z
  .instanceof(FormData)
  .transform(formDataToObject)
  .pipe(IncreGameFormInputSchema.transform(serverGameTransform));

export const UserUpdateFormServerSchema = z
  .instanceof(FormData)
  .transform(formDataToObject)
  .pipe(
    UserUpdateFormInputSchema.transform((form) => ({
      ...form, // do not set password if leaves empty string
      password: form.password.length > 0 ? form.password : undefined,
      hasAvatar: form.avatar.length > 0 ? true : undefined, // from 0 to 1 or no change
      contacts: form.contacts
        .map((contact) => `${contact.way}:${contact.content}`)
        .join(","),
    }))
  );

export const AddUserServerSchema = z.array(
  z.object({
    name: NameSchema,
    qq: QQSchema,
    isAdmin: BooleanSchema,
    avatar: URLSchema,
  })
);

export const UserAdminEditServerSchema = z.object({
  id: IDSchema,
  qq: QQSchema,
  isAdmin: z.boolean().default(false),
  resetPassword: z.boolean().default(false),
});
