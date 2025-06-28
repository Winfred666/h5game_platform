import { getUsersByNameOrQQ } from "@/lib/services/getUser";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("name_qq");
  return new Response(
    JSON.stringify(await getUsersByNameOrQQ(query)),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
