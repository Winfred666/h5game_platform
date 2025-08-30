import "server-only";

import { cache } from "react";
import { authProtectedModule, buildServerQuery } from "../services/builder";
import { StringSchema } from "../types/zparams";
import { db } from "../dbInit";

export const getAllTags = cache(buildServerQuery([], async () => {
  const tags = await db.tag.findMany();
  // console.log("Fetched tags:", tags);
  return tags;
}));

// WARNING: using undefined (not found, not error) if cannot find tag.
export const getTagById = buildServerQuery([StringSchema], (id) =>
  db.tag.findUnique({
    where: { id: id },
  })
);

export const getAllTagsAdmin = buildServerQuery([], () => {
  authProtectedModule(true); // must be admin
  return db.tag.findMany({
    where: {
      hide: undefined, // include hidden tags for admin
    },
    select: {
      id: true,
      name: true,
      hide: true,
      _count: {
        select: { games: true },
      },
    },
  });
});

export const getTagsByName = buildServerQuery([StringSchema], (name) =>
  db.tag.findMany({
    where: {
      name: {
        contains: name,
      },
    },
    take: 10, // limit to 10 results for performance
  })
); // true means it is a query, not mutation, so it can return 404
