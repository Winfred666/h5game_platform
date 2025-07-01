"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GameFormInputType } from "@/lib/types/zforms";
import Image from "next/image";
import GamePosters from "@/components/GamePosters";
import { Button } from "@/components/ui/button";
import { useMultiObjectURLs } from "@/lib/hooks/useBrowser";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChangeEvent, useRef } from "react";
import { MAX_SCREENSHOT_NUMBER } from "@/lib/clientConfig";
import { Input } from "@/components/ui/input";

interface GameFormImagesProps {
  form: UseFormReturn<GameFormInputType>;
  oldCoverSrc?: string;
  oldScreenshotsSrc?: string[];
}

function CoverForm(
  {
    onChange,
    onBlur,
    value,
  }: {
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: File[];
  },
  fallbackUrl?: string
) {
  const urls = useMultiObjectURLs(value);
  const coverPreview = urls.length > 0 ? urls[0] : fallbackUrl;

  return (
    <FormItem className=" w-60">
      <FormLabel>封面图片</FormLabel>
      <FormControl>
        <div className="relative w-full h-60 border aria-invalid:border-destructive rounded-md bg-input/30">
          {coverPreview && (
            <Image
              fill
              unoptimized
              className=" object-cover"
              src={coverPreview}
              alt="Cover Preview"
            />
          )}
          <div className="w-full h-full flex items-center justify-center">
            <span
              className={cn(
                "text-center z-10 ",
                coverPreview
                  ? "bg-gray-500/30 text-white p-1 rounded-sm"
                  : "text-muted-foreground"
              )}
            >
              点击或拖拽以{coverPreview ? "替换" : "上传"}封面
            </span>
          </div>
          <Input
            className="absolute z-20 top-0 left-0 w-full h-full opacity-0"
            type="file"
            accept="image/*"
            onChange={(e) => onChange(Array.from(e.target.files ?? []))}
            onBlur={onBlur}
          />
        </div>
      </FormControl>
      <FormMessage className="break-all" />
    </FormItem>
  );
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
      <GamePosters imageList={coverPreview} onDelete={onDeleteScreenshot} onBlur={onBlur}/>
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
  return (
    <div className="flex flex-col gap-6">
      {/* --- Cover Image Section --- */}
      <FormField
        control={form.control}
        name="cover"
        render={({ field }) => CoverForm(field, oldCoverSrc)}
      />
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
