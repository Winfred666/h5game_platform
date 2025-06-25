import {
  GameFormLayout,
  GameFormMainDetails,
  GameFormImages,
  GameData,
} from "@/components/forms/game-form";
import { updateGame } from "@/app/actions/game-actions"; // Your server action

async function getGameById(id: string): Promise<GameData> {
  // Fetch game data from your database using the ID
  // This is a mock. Replace with your actual data fetching logic.
  return {
    id: "123",
    title: "My Awesome Game",
    kind: "html",
    game_filename: "game_v1.zip",
    embed_op: "fullscreen",
    width: 1280,
    height: 720,
    description: "This is a great game.",
    tags: ["Action", "Shooter"],
    developers_string: "collaborator1,collaborator2",
    cover_url: "https://placehold.co/300x300/purple/white?text=Cover",
    screenshots: [
        { id: "ss1", url: "https://placehold.co/150x150/orange/white?text=SS1" },
        { id: "ss2", url: "https://placehold.co/150x150/green/white?text=SS2" },
    ]
  };
}

async function getAllTags() {
  // Fetch tags from your database
  return ["Action", "Adventure", "RPG", "Strategy", "Shooter", "Puzzle"];
}

interface EditGamePageProps {
  params: { id: string };
}

export default async function EditGamePage({ params }: EditGamePageProps) {
  const [game, allTags] = await Promise.all([
    getGameById(params.id),
    getAllTags(),
  ]);

  return (
    <GameFormLayout
      action={updateGame}
      title="Edit Project"
      description="Update the details for your game below."
      submitButtonText="Save Changes"
    >
      <GameFormMainDetails allTags={allTags} game={game} />
      <GameFormImages
        currentCoverUrl={game.cover_url}
        currentScreenshots={game.screenshots}
      />
    </GameFormLayout>
  );
}