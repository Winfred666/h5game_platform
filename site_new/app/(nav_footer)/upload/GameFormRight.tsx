// src/components/GameFormImages.tsx

import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import { GameFormValues } from "@/lib/validators/game"; // Import the type

interface Screenshot {
  id: string;
  url: string;
}

interface GameFormImagesProps {
  form: UseFormReturn<GameFormValues>; // The entire form object from react-hook-form
  currentCoverUrl?: string;
  currentScreenshots?: Screenshot[];
}

export function GameFormImages({ form, currentCoverUrl, currentScreenshots }: GameFormImagesProps) {
  const coverFile = form.watch("cover");
  const newScreenshots = form.watch("screenshots") || [];
  
  // Create preview URL for the new cover image if it's a File
  const coverPreview = coverFile instanceof File ? URL.createObjectURL(coverFile) : null;

  return (
    <div className="space-y-6 rounded-lg border p-4">
      {/* --- Cover Image --- */}
      <FormField
        control={form.control}
        name="cover"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover Image</FormLabel>
            <FormControl>
              <>
                {coverPreview ? (
                  // --- NEW COVER PREVIEW ---
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">New cover preview:</p>
                    <div className="relative w-fit">
                      <Image src={coverPreview} alt="New Cover Preview" width={300} height={300} className="rounded-lg border object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-full"
                        onClick={() => form.setValue("cover", currentCoverUrl || null, { shouldValidate: true })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : currentCoverUrl ? (
                  // --- CURRENT COVER ---
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current cover:</p>
                    <Image src={currentCoverUrl} alt="Current Cover" width={300} height={300} className="rounded-lg border object-cover" />
                    <Label htmlFor="cover-input" className="text-sm font-medium cursor-pointer text-primary hover:underline">
                      Upload a new image to replace it
                    </Label>
                    <Input
                      id="cover-input"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </div>
                ) : (
                  // --- UPLOAD PLACEHOLDER ---
                  <div className="flex items-center justify-center w-full">
                    <Label htmlFor="cover-input" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">点击或拖拽上传图片</p>
                      </div>
                       <Input
                        id="cover-input"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </Label>
                  </div>
                )}
              </>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      {/* --- Screenshots --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Screenshots</h3>
        
        {/* --- EXISTING SCREENSHOTS --- */}
        {currentScreenshots && currentScreenshots.length > 0 && (
          <FormField
            control={form.control}
            name="screenshots_to_delete"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm text-muted-foreground">Current screenshots (select to delete)</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentScreenshots.map(ss => (
                    <div key={ss.id} className="relative">
                      <Image src={ss.url} alt="Screenshot" width={200} height={200} className="rounded-md border object-cover aspect-video" />
                      <div className="absolute top-1 right-1">
                        <Checkbox
                          checked={field.value?.includes(ss.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), ss.id])
                              : field.onChange(field.value?.filter((value) => value !== ss.id));
                          }}
                          className="bg-background/80 border-primary data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </FormItem>
            )}
          />
        )}

        {/* --- NEW SCREENSHOTS UPLOAD & PREVIEW --- */}
        <FormField
          control={form.control}
          name="screenshots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload new screenshots</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => field.onChange(Array.from(e.target.files || []))}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">You can select multiple files.</p>
              <FormMessage />
            </FormItem>
          )}
        />
        {newScreenshots.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">New screenshots preview:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {newScreenshots.map((file, index) => (
                <div key={index} className="relative">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    width={200}
                    height={200}
                    className="rounded-md border object-cover aspect-video"
                    onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} // Clean up object URLs
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}