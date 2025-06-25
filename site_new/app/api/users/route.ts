import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("name");
  return new Response(
    JSON.stringify({ result: await getGamesByTitle(query) }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
