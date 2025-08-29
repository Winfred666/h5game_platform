import { Separator } from "@/components/ui/separator";
import { UserThumbnail } from "@/components/UserListItem";
import { getAllUsers } from "@/lib/querys&actions/getUser";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import Link from "next/link";

export default async function CommunityPage() {
  const allUsers = await getAllUsers();
  const userClassified: {
    [key: string]: {
      id: number;
      name: string;
      avatar?: string;
      createdAt: string;
    }[];
  } = {};
  allUsers.forEach((user) => {
    const year = user.createdAt.split("/")[0];
    if (!userClassified[year]) {
      userClassified[year] = [user];
    } else {
      userClassified[year].push(user);
    }
  });

  return (
    <div className="w-full flex flex-col grow gap-6 mt-6">
      {Object.entries(userClassified).map(([year, users]) => (
        <div key={`year_${year}`} className="flex flex-col gap-2 mx-6">
          <h3> {year} 年</h3>
          <Separator />
          <div className="flex flex-wrap gap-4">
            {users.map((user) => (
              <Link
                href={ALL_NAVPATH.user_id.href(user.id)}
                key={`user_${user.id}`}
                className="flex flex-col items-center gap-2"
              >
                <UserThumbnail
                  user={user}
                  className=" flex-col items-center bg-card text-card-foreground p-2 rounded-md border"
                />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// use revalidatePath + static for any tourist page to speed up
export const dynamic = "force-static";
