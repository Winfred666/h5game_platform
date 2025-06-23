// with this mark every function exported will be server action (for mutate)
// define server actions here, directly use prisma-client to fetch data from sqlite
"use server"


export type ActionHandler <TArgs extends any[], TReturn> = (...args: TArgs) => Promise<TReturn>;

