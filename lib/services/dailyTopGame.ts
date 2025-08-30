import "server-only";
import { db } from "@/lib/dbInit";
import { IGame } from "../types/igame";
import { ENABLE_DAILY_RECOMMENDATION_KEY, getConfigurationValue, setConfigurationValue, SWIPER_ID_KEY } from "../serverConfig";

type GameScore = Pick<IGame, "id" | "title"> & {
  score: number;
  views: number;
  updatedAt: Date;
};

async function calculateTopGames(): Promise<string[]> {
  console.log("🔄 Calculating top games...");

  // Get all public games with necessary data
  const games = await db.game.findMany({
    select: {
      id: true,
      title: true,
      views: true,
      updatedAt: true,
    },
    take: 150, // Limit to top 150 by views for performance
  });

  if (games.length === 0) return [];

  const now = new Date();
  const maxDaysOld = 365; // Games older than 1 year get minimum freshness

  // Calculate scores for each game
  const gamesWithScores: GameScore[] = games.map((game) => {
    // 1. Popularity Score (80% weight) - views
    const popularityScore = game.views;
    // 2. Freshness Score (20% weight) in days - based on updatedAt
    const daysSinceUpdate = Math.floor(
      (now.getTime() - game.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const freshnessRatio = Math.max(0, 1 - daysSinceUpdate / maxDaysOld);
    const freshnessScore = freshnessRatio * 100;

    // Combined score: 80% popularity + 20% freshness
    const finalScore = popularityScore * 0.8 + freshnessScore * 0.2;

    return {
      ...game,
      score: finalScore,
    };
  });

  // Sort by score and return top 3 IDs
  const topGames = gamesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  console.log(
    "✅ Top games calculated:",
    topGames.map((g) => g.title).join(", ")
  );
  return topGames.map((g) => g.id);
}

// Global interval reference
let topGamesInterval: NodeJS.Timeout | null = null;

export async function startAutoTopGamesCalc() {
  const calcAndSave = async () => {
    const cur_mode = await getConfigurationValue(ENABLE_DAILY_RECOMMENDATION_KEY);
    if (cur_mode === "0") {
      stopAutoTopGamesCalc();
      return false;
    } else {
      const gameIds = await calculateTopGames();
      await setConfigurationValue(SWIPER_ID_KEY, gameIds.join(","));
      // timer revalidate should set just set in the home page.
      // revalidatePath(ALL_NAVPATH.home.href());
      return true;
    }
  };
  
  // 1. Calculate immediately
  const stopped = await calcAndSave();

  // 2. set up daily interval
  if (topGamesInterval === null && !stopped){
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    topGamesInterval = setInterval(calcAndSave, TWENTY_FOUR_HOURS);
  }
}

export function stopAutoTopGamesCalc() {
  if (topGamesInterval) {
    clearInterval(topGamesInterval);
    topGamesInterval = null;
  }
}
