import { ALL_NAVPATH } from "@/services/router_info";
import { getAllUsers } from "@/services/user";
import { IUser } from "@/types/iuser";
import { Avatar, Card, CardContent, Divider, Typography } from "@mui/material";
import Link from "next/link";

export default async function CommunityPage() {
  const all_users = await getAllUsers();

  const userClassified: { [key: string]: IUser[] } = {};
  // classify by the year of registration

  all_users.forEach((user) => {
    const year = user.created_at.split("/")[0];
    if (!userClassified[year]) {
      userClassified[year] = [user];
    } else {
      userClassified[year].push(user);
    }
  });

  return (
    <main className="w-full flex flex-col grow gap-6 mt-6">
      {Object.entries(userClassified).map(([year, users]) => (
        <div key={`year_${year}`} className="flex flex-col gap-2 mx-6">
          <Typography variant="h4">{year}年</Typography>
          <Divider />
          <div className=" flex flex-row gap-4 flex-wrap">
            {users.map((user) => (
              <Link href={ALL_NAVPATH.user_id.href(user.id)}
              key={`user_${user.id}`}>
                <Card
                  className="w-fit"
                >
                  <CardContent className=" flex flex-col gap-2 items-center">
                    <Avatar alt={user?.name ?? "游客"} src={user?.profile} />
                    <Typography variant="body1">{user.name}</Typography>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
