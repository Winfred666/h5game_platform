import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UploadCloud, X } from "lucide-react";

interface Screenshot {
  id: string;
  url: string;
}

interface GameFormImagesProps {
  currentCoverUrl?: string;
  currentScreenshots?: Screenshot[];
}

export function GameFormImages({ currentCoverUrl, currentScreenshots }: GameFormImagesProps) {
  return (
    <div className="space-y-6">
      {/* --- Cover Image --- */}
      <div className="space-y-2">
        <Label htmlFor="cover">Cover Image</Label>
        {currentCoverUrl ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Current cover:</p>
            <Image src={currentCoverUrl} alt="Current Cover" width={300} height={300} className="rounded-lg border object-cover" />
            <Label htmlFor="cover" className="text-sm font-medium cursor-pointer text-primary hover:underline">
              Upload a new image to replace it
            </Label>
            <Input id="cover" name="cover" type="file" className="hidden" accept="image/*" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Label htmlFor="cover" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
              <Input id="cover" name="cover" type="file" className="hidden" accept="image/*" required />
            </Label>
          </div>
        )}
      </div>

      <Separator />

      {/* --- Screenshots --- */}
      <div className="space-y-2">
        <Label>Screenshots</Label>
        {currentScreenshots && currentScreenshots.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Current screenshots:</p>
            <div className="grid grid-cols-2 gap-2">
              {currentScreenshots.map(ss => (
                <div key={ss.id} className="relative group">
                  <Image src={ss.url} alt="Screenshot" width={150} height={150} className="rounded-md border object-cover" />
                  <div className="absolute top-1 right-1 flex items-center space-x-1 bg-background/80 p-1 rounded-md">
                      <Checkbox id={`delete_ss_${ss.id}`} name="screenshots_to_delete" value={ss.id}/>
                      <Label htmlFor={`delete_ss_${ss.id}`} className="text-xs cursor-pointer">Delete</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <Label htmlFor="screenshots" className="text-sm font-medium">Upload new screenshots</Label>
        <Input id="screenshots" name="screenshots" type="file" multiple accept="image/*" />
        <p className="text-sm text-muted-foreground">You can select multiple files.</p>
      </div>
    </div>
  );
}