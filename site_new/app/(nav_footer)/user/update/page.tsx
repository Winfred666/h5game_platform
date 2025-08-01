import { getUserById } from "@/lib/querys&actions/getUser";
import UserUpdateForm from "./UserUpdateForm";

export default async function UserUpdatePage() {
  const user = await getUserById("me");
  return (
    <div className="max-w-full lg:w-4xl mx-auto py-8 px-4">
      <UserUpdateForm currentUser={user} />
    </div>
  );
}
