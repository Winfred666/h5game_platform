"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GameFormInputType } from "@/lib/types/zformClient";
import GamePosters from "@/components/GamePosters";
import { Button } from "@/components/ui/button";
import { useMultiObjectURLs } from "@/lib/hooks/useBrowser";
import { Plus } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import { MAX_SCREENSHOT_NUMBER } from "@/lib/clientConfig";
import SingleImageForm from "@/components/inputs/SingleImageInputWithLabel";

interface GameFormImagesProps {
  form: UseFormReturn<GameFormInputType>;
  oldCoverSrc?: string;
  oldScreenshotsSrc?: string[];
}

function ScreenshotForm(
  {
    value,
    onChange,
    onBlur,
  }: {
    value: {
      delete: number[];
      add: File[];
    };
    onChange: (...event: any[]) => void;
    onBlur: () => void;
  },
  oldSrcs: string[]
) {
  const screenshotInput = useRef<HTMLInputElement>(null);
  const newSrcs = useMultiObjectURLs(value.add);

  const coverPreview = oldSrcs
    .filter((ss, index) => !value.delete.includes(index))
    .concat(newSrcs)
    .map((src, index) => ({
      src,
      alt: `screenshot_${index}`,
    }));

  const onDeleteScreenshot = (img: { src: string }) => {
    const oldIndex = oldSrcs.indexOf(img.src);
    if (oldIndex != -1) {
      onChange({
        add: value.add,
        delete: [...value.delete, oldIndex],
      });
    } else {
      const newIndex = newSrcs.indexOf(img.src);
      // console.log("New index to delete:", newIndex);
      if (newIndex == -1)
        throw Error(
          "onDeleteScreenshot:should not happen, deleted screenshot not exist in model "
        );
      onChange({
        add: value.add.filter((_, i) => i !== newIndex),
        delete: value.delete,
      });
    }
  };

  const onConcatScreenshot = (e: ChangeEvent<HTMLInputElement>) =>
    onChange({
      ...value,
      add: value.add.concat(Array.from(e.target.files ?? [])),
    });

  return (
    <FormItem>
      <FormLabel>游戏截图</FormLabel>
      {/* 1. Render existing screenshots (with delete icon) */}
      {/* Filter out the existing screenshots that are marked for deletion
            also add newly added screenshots that are not yet uploaded*/}
      <GamePosters
        id="upload_screenshots"
        imageList={coverPreview}
        onDelete={onDeleteScreenshot}
        onBlur={onBlur}
      />
      <FormControl>
        {/* 2. Adder icon */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          id="screenshots-upload"
          onClick={() => screenshotInput.current?.click()}
          onBlur={onBlur}
          disabled={coverPreview.length >= MAX_SCREENSHOT_NUMBER}
          className=" mt-2 aria-invalid:text-muted-foreground aria-invalid:bg-muted"
        >
          <Plus />
          <input
            className=" hidden absolute"
            type="file"
            accept="image/*"
            multiple
            onChange={onConcatScreenshot}
            ref={screenshotInput}
          />
        </Button>
      </FormControl>
      <FormMessage className=" break-all" />
    </FormItem>
  );
}

export function GameFormRight({
  form,
  oldCoverSrc,
  oldScreenshotsSrc = [],
}: GameFormImagesProps) {
  // get the value from form
  const kindOfProject = form.watch("kind");
  const embedOpProject = form.watch("embed_op");
  return (
    <div className="flex flex-col gap-6">
      {/* --- Cover Image Section --- */}

      <FormField
        control={form.control}
        name="cover"
        render={({ field }) => SingleImageForm(field, oldCoverSrc)}
      />
      <span className=" text-muted-foreground text-sm">
        {kindOfProject === "html" && embedOpProject === "embed"
          ? "封面展示宽高将与游戏宽高相同"
          : "封面展示宽高比为3:1"}
      </span>
      {/* --- Screenshots Section --- */}
      {/* 3. The upload placeholder always available to add more */}
      <FormField
        control={form.control}
        name="screenshots"
        render={({ field }) => ScreenshotForm(field, oldScreenshotsSrc)}
      />
    </div>
  );
}
