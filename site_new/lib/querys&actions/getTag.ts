import "server-only";
import { cache } from "react";
import { buildServerQuery } from "../services/builder";
import { IntSchema, StringSchema } from "../types/zparams";
import { db } from "../dbInit";



export const getAllTags = cache(buildServerQuery([], () => db.tag.findMany()));

// WARNING: using undefined (not found, not error) if cannot find tag.
export const getTagById = buildServerQuery([IntSchema], (id) =>
  db.tag.findUnique({
    where: { id: id },
  })
);

export const getTagsByTitle = buildServerQuery([StringSchema], (title) =>
  db.tag.findMany({
    where: {
      name: {
        contains: title,
      },
    },
    take: 10, // limit to 10 results for performance
  })
); // true means it is a query, not mutation, so it can return 404
