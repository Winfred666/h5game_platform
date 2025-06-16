// here admin could delete the game or user

import { IGame } from "@/types/igame";
import useSWR, { useSWRConfig } from "swr";
import { IUser } from "@/types/iuser";
import {
  useClientFetch,
  preprocessGames,
  preprocessUser,
} from "@/services/utils";

export type BatchedUsers = { qq: string; name: string }[];

// only display + delete games
export function useGamesManager() {
  const {
    data: games,
    isLoading,
    error,
    mutate,
  } = useSWR<IGame[]>("/game", { fallback: [] });
  
  const client_fetch = useClientFetch();
  // provide delete game function
  const deleteGame = async (id: string, user_id: string) => {
    const result = await client_fetch(
      `/admin/game?id=${user_id}&game_id=${id}`,
      { method: "DELETE" },
      "删除游戏失败！"
    );
    if (result) {
      mutate(games?.filter((game: IGame) => game.id !== id));
    }
  };
  return { games: preprocessGames(games), deleteGame, isLoading, error };
}

// could be used to display, delete or create user, change user's qq/password
export function useUserManager() {
  const {
    data: users,
    isLoading,
    error,
    mutate,
  } = useSWR<IUser[]>("/user", { fallback: [] });
  
  const { mutate: mutate_path } = useSWRConfig();
  const client_fetch = useClientFetch();

  // provide delete user function
  const deleteUser = async (id: string) => {
    const result = await client_fetch(
      `/admin/user?id=${id}`,
      {
        method: "DELETE",
      },
      "删除用户失败！"
    );
    if (result) mutate(users?.filter((user: IUser) => user.id !== id));
  };
  const addUsers = async (users: BatchedUsers): Promise<number> => {
    const res: { number: number; detail: any } = await client_fetch(
      "/admin/user",
      {
        method: "PUT",
        headers: {
          // 添加请求头
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ list: users }),
      },
      "批量添加用户失败！检查格式或网络连接"
    );
    if (res) {
      mutate_path("/user");
      return res.number;
    } else return 0;
  };
  const changeUser = async (
    id: string,
    qq?: string,
    hash?: string,
    admin?: boolean
  ) => {
    if (!qq && !hash && !admin) throw new Error("No changes to be made");
    const formdata = new FormData();
    if (qq) formdata.append("qq", qq);
    if (hash) formdata.append("hash", hash);
    formdata.append("admin", String(admin));
    const result = await client_fetch(
      `/admin/bind?id=${id}`,
      {
        method: "PUT",
        credentials: "include",
        body: formdata,
      },
      "修改用户信息失败！"
    );
    if (result) mutate_path("/user");
  };
  users?.forEach((user) => {
    // preprocess user data
    preprocessUser(user);
  });
  return { users, deleteUser, isLoading, error, addUsers, changeUser };
}

export function useGameAudit() {
  const {
    data: games,
    isLoading,
    error,
    mutate,
  } = useSWR<IGame[]>("/admin/game", { fallback: [] });
  const client_fetch = useClientFetch();

  // provide audit approve function
  const approveGame = async (id: string) => {
    const result = await client_fetch(
      `/admin/game?id=${id}&state=true`,
      { method: "PUT" },
      "审核游戏失败！"
    );
    if (result) mutate(games?.filter((game: IGame) => game.id !== id));
  };
  // console.log(games);
  return { approveGame, isLoading, error, games: preprocessGames(games) };
}

export function useAdminTags() {
  const { data: allTags } = useSWR<string[] | undefined>(`/tag`, {
    fallbackData: [],
  });
  const { mutate:mutate_path } = useSWRConfig();
  const client_fetch = useClientFetch();
  
  const addTag = async (tag: string) => {
    const formdata = new FormData();
    if (!allTags) return;
    formdata.append("tags", allTags.join(",") + "," + tag);
      const result = await client_fetch("/admin/tag", {
        method: "PUT",
        body: formdata,
      },"添加标签失败！");
      if (result) mutate_path("/tag"); // 更新缓存
  };

  const deleteTag = async (tag: string) => {
    // find the tag in the allTags array
    const formdata = new FormData();
    if (!allTags) return;
    const newTags = allTags.filter((t) => t !== tag);
    formdata.append("tags", newTags.join(","));
    const result = await client_fetch("/admin/tag", {
      method: "PUT",
      body: formdata,
    }, "删除标签失败！");
    if (result) mutate_path("/tag"); // 更新缓存
  };
  const tags = allTags ?? [];
  return { addTag, deleteTag, tags };
}
