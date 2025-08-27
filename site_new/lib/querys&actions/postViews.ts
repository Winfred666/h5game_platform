"use server";

import { db } from "../dbInit";
import { buildServerAction } from "../services/builder";
import { IDSchema } from "../types/zparams";

// increment views when anyone click the button
export const increViewsAction = buildServerAction([IDSchema], async (id) =>
  db.game.update({
    where: {
      id,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  })
);
