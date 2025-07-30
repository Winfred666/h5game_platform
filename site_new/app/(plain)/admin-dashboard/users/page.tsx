import UsersTab from "./UsersTab";
import { getAllUsers } from "@/lib/querys&actions/getUser";

export default async function AdminReviewPage() {
  const users = await getAllUsers();
  return (
    <UsersTab users={users} />
  )
}