import { getTopGames } from "@/lib/querys&actions/getGame";
import {
  ENABLE_DAILY_RECOMMENDATION_KEY,
  getConfigurationValue,
} from "@/lib/serverConfig";
import TopGameTab from "./TopGameTab";

export default async function PlainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // config top games
  const topGames = await getTopGames();
  const autoEnabler = (await getConfigurationValue(
    ENABLE_DAILY_RECOMMENDATION_KEY
  )) as "0" | "1";

  return (
    <div className="space-y-8">
      <TopGameTab topGames={topGames} autoEnabler={autoEnabler} />
      {children}
    </div>
  );
}
