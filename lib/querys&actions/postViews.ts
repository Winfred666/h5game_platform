"use server";

import { headers } from "next/headers";
import { db } from "../dbInit";
import { buildServerAction } from "../services/builder";
import { IDSchema } from "../types/zparams";
import { userViewBucket } from "../dbInit";
// increment views when anyone click the button,
// to prevent multiple increments from same user in short time,
// use a small bucket time window in memory, e.g. 1 hour, based on user IP


export const increViewsAction = buildServerAction([IDSchema], async (id) => {
  const headersList = await headers();
  const userIP = headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
  console.log(`increViewsAction called for game id=${id} from IP=${userIP}`);

  if (!userIP) return; // cannot track user, ignore

  const viewedId = userViewBucket.get(userIP) || 0;

  // If the last viewed time is within the debounce window, ignore the request
  if (viewedId === id) return; // already viewed this game recently
  userViewBucket.set(userIP, id);

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
