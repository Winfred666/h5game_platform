import { IUser } from "@/types/iuser";
import { preprocessUser } from "./utils";

export const getAllUserss = async (): Promise<IUser[]> => {
  // Construct the absolute path to the image
  try{
    let users:any = await fetch(process.env.SERVER_URL + "/user");
    users = await users.json();
    users = users.map(preprocessUser).filter((user:any) => user !== undefined);
    return users as IUser[];
  } catch(e){
    console.error("Next.js Server: Fail to fetch users!");
    return []; // Return an empty array in case of error
  }
}