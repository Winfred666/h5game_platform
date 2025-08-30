import UsersTab from "./UsersTab";
import { getAllUsersWithQQ } from "@/lib/querys&actions/getUser";

export default async function AdminUserPage() {
  const users = await getAllUsersWithQQ();
  return (
    <UsersTab users={users} />
  )
}