import { GAME_PAGE_SIZE } from "@/lib/clientConfig";
import UsersTab from "./UsersTab";
import { getAllUsersWithQQ, getUserCount } from "@/lib/querys&actions/getUser";

export default async function AdminUserPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const curPage = parseInt(page || "1"); // page start from 1 while index from 0.
  // Use pagination here just like game, to avoid too large response and long wait.
  const [pagedUser, userCount] = await Promise.all([
      getAllUsersWithQQ(curPage, GAME_PAGE_SIZE),
      getUserCount(),
    ]);
  return <UsersTab users={pagedUser} currentPage={curPage} pageSize={GAME_PAGE_SIZE} totalCount={userCount} />;
}
