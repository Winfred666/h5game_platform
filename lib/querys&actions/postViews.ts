"use server";

import { headers } from "next/headers";
import { db } from "../dbInit";
import { buildServerAction } from "../services/builder";
import { IDSchema } from "../types/zparams";
import { INCRE_VIEWS_ACTION_DEBOUNCE_MS } from "../serverConfig";

// increment views when anyone click the button,
// to prevent multiple increments from same user in short time,
// use a small bucket time window in memory, e.g. 1 hour, based on user IP

const userViewBucket: Map<string, number> =
  globalThis.userViewBucket ?? (globalThis.userViewBucket = new Map());


export const increViewsAction = buildServerAction([IDSchema], async (id) => {
  const headersList = await headers();
  const userIP = headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
  console.log(`increViewsAction called for game id=${id} from IP=${userIP}`);

  if (!userIP) return; // cannot track user, ignore

  const currentTime = Date.now();
  const lastViewed = userViewBucket.get(userIP) || 0;

  // If the last viewed time is within the debounce window, ignore the request
  if (currentTime - lastViewed < INCRE_VIEWS_ACTION_DEBOUNCE_MS) return;
  // Update the last viewed time for this user IP
  userViewBucket.set(userIP, currentTime);

  db.game.update({
    where: {
      id,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });
});
