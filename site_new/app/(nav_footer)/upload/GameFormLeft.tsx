import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { IGame } from "@/types/game"; // A placeholder type for your game data

// Define a type for your game data. Adjust as needed.
// You might already have this defined elsewhere.
export interface GameData {
  id: string;
  title: string;
  kind: "downloadable" | "html";
  game_filename?: string;
  embed_op?: "embed_in_page" | "fullscreen";
  width?: number;
  height?: number;
  description: string;
  tags: string[];
  developers_string?: string; // e.g., "user1,user2,user3"
}

interface GameFormMainDetailsProps {
  allTags: string[];
  game?: GameData;
}

export function GameFormMainDetails({ allTags, game }: GameFormMainDetailsProps) {
  return (
    <div className="md:col-span-2 space-y-6">
      {/* Hidden input for the ID, only used in edit mode */}
      {game && <input type="hidden" name="gameId" value={game.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={game?.title} placeholder="Enter your game name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kind">Kind of Project</Label>
        <Select name="kind" defaultValue={game?.kind} required>
          <SelectTrigger id="kind"><SelectValue placeholder="Select a project type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="downloadable">Downloadable - Files to be downloaded.</SelectItem>
            <SelectItem value="html">HTML - Playable in the browser.</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="uploadfile">Game File</Label>
        {game?.game_filename && (
            <p className="text-sm text-muted-foreground">
                Current file: <strong>{game.game_filename}</strong>. Uploading a new file will replace it.
            </p>
        )}
        <Input id="uploadfile" name="uploadfile" type="file" required={!game} />
        <p className="text-sm text-muted-foreground">Upload a .zip or .html file. Max size: 1GB.</p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Embed Options (for HTML games)</h3>
        <div className="space-y-2">
          <Label htmlFor="embedop">Display Mode</Label>
          <Select name="embedop" defaultValue={game?.embed_op || "fullscreen"}>
            <SelectTrigger id="embedop"><SelectValue placeholder="Select display mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="embed_in_page">Embed in page</SelectItem>
              <SelectItem value="fullscreen">Click to launch in fullscreen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Viewport Dimensions (if embedded)</Label>
          <div className="flex items-center gap-2">
            <Input name="width" placeholder="Width" defaultValue={game?.width || 960} className="w-24" />
            <span>x</span>
            <Input name="height" placeholder="Height" defaultValue={game?.height || 540} className="w-24" />
            <span>px</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={game?.description} placeholder="Describe your game..." rows={6} />
      </div>

      <div className="space-y-3">
        <Label>Genre / Tags</Label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {allTags.map((tag) => (
            <div key={tag} className="flex items-center space-x-2">
              <Checkbox id={`tag-${tag}`} name="tags" value={tag} defaultChecked={game?.tags.includes(tag)} />
              <Label htmlFor={`tag-${tag}`} className="font-normal cursor-pointer">{tag}</Label>
            </div>
          ))}
        </div>
      </div>
      
       <div className="space-y-2">
        <Label htmlFor="developers">Co-Developers</Label>
        <Input id="developers" name="developers" defaultValue={game?.developers_string} placeholder="Enter co-developer usernames, comma-separated" />
         <p className="text-sm text-muted-foreground">
          The current user is automatically added. This field is for collaborators.
        </p>
      </div>
    </div>
  );
}