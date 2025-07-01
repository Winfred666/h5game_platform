"use server";
import { buildServerAction } from "../services/builder";
// with this mark every function exported will be server action (for mutate)
// define server actions here, directly use prisma-client to fetch data from sqlite
import { GameFormServerSchema } from "../types/zforms";

export const submitNewGameAction = buildServerAction(
  [GameFormServerSchema],
  async (data) => {
    return 1;
  }
);
