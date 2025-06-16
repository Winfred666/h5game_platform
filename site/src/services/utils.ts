// just process string, algorithms
import { useSnackBar } from "@/components/SnackBarContext";
import { IDeveloper, IGame } from "@/types/igame";
import { IContact, IUser } from "@/types/iuser";
import { createHash } from "crypto";

export const preprocessUser = (user: any): IUser => {
  if(!user || Array.isArray(user.contacts)) return user;
  const date = new Date(user.created_at);
  const formattedDate = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  user.id = user.id.toString(); // ensure id is a string
  user.created_at = formattedDate;
  user.contacts = typeof user.contacts === "string" ? parseContactsString(user.contacts) : [];
  user.games = user.games ?? [];
  return user;
};

export const preprocessGames = (games: any): IGame[] => {
  // if game is array
  if (!Array.isArray(games)) {
    return [];
  }
  return (
    (games
      .map((game: any) => preprocessGame(game))
      .filter(
        (game: IGame | undefined) => game !== undefined && game.id !== undefined
      ) as IGame[]) ?? []
  );
};

export const preprocessGame = (game: any): IGame | undefined => {
  // turn tag string list into IGameTag[]
  try {
    if (!game || (typeof game.size === 'string' && game.size.endsWith('MB'))) return game;
    if (!game.developer) {
      game.developer = game.developers;
    }
    game.joinDevelopers = game.developer
      .map((dev: IDeveloper) => dev.name)
      .join(", ");
    //console.log("before preprocess tags: " + game.tags);
    
    game.tags = game.tags ?? []; // 确保 tags 是数组

    const date = new Date(game.release_date);
    const chineseFormat = date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false // 24小时制
    });
    game.release_date = chineseFormat;    
    //console.log("after preprocess tags: " + game.tags);
    game.size = (parseFloat(game.size) / (1024 * 1024)).toFixed(2) + " MB"; // 转换为MB并保留两位小数
    game.id = game.id.toString(); // 确保id是字符串
    return game;
  } catch (e) {
    console.error("Error preprocessing game:", e);
    return undefined;
  }
};

//将contacts(一个长字符串,以"way1:content1,way2:content2"的形式存储)转换为IContact数组
export const parseContactsString = (contactsString: string): IContact[] => {
  if (!contactsString) return [];
  return contactsString.split(",").map((contact) => {
    const [way, content] = contact.split(":");
    return { way, content };
  });
};

export const encryptPassword = (password: string): string =>
  createHash("sha256").update(password).digest("hex");


// automatically add client_fetch to all API calls.
export function useClientFetch(){
  const snackBar = useSnackBar();
  const client_fetch = async (API: string, options?: RequestInit, errorText:string = "网络错误"): Promise<any> => (
      fetch(process.env.NEXT_PUBLIC_SERVER_URL + API, {
        ...options,
        credentials: "include",
      }).then(async (response)=>{
        if (!response.ok) {
          return response.json().then((err)=>{
            if(typeof err.detail === "string"){
              throw new Error(err.detail);
            } else {
              throw new Error(errorText);
            }
          })
        }
        return response.json();
      }).catch(err =>{
        console.error("请求失败！", err);
        if (err instanceof Error) {
          snackBar.open(err.message);
        }
      })
  )
  return client_fetch;
}