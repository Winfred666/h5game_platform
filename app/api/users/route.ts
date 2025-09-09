import { getUsersByNameOrQQ, getUserByNameOrQQWithQQ } from "@/lib/querys&actions/getUser";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const query = sp.get("name_qq") || "";
  const wantAdmin = sp.get("include") === "admin"; // ?include=admin to request sensitive fields

  if (!wantAdmin) {
    const data = await getUsersByNameOrQQ(query);
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    // Will internally verify admin via authProtectedModule(true)
    const data = await getUserByNameOrQQWithQQ(query);
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
}
