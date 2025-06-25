import {
  GameFormLayout,
  GameFormMainDetails,
  GameFormImages,
} from "@/components/forms/game-form";
import { createGame } from "@/app/actions/game-actions"; // Your server action

async function getAllTags() {
  // Fetch tags from your database
  return ["Action", "Adventure", "RPG", "Strategy", "Shooter", "Puzzle"];
}

export default async function NewGamePage() {
  const allTags = await getAllTags();

  return (
    <GameFormLayout
      action={createGame}
      title="Create a New Project"
      description="Fill out the details below to add your new game."
      submitButtonText="Submit Project"
    >
      <GameFormMainDetails allTags={allTags} />
      <GameFormImages />
    </GameFormLayout>
  );
}