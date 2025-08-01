import Image from "next/image";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useMultiObjectURLs } from "@/lib/hooks/useBrowser";

// WARNING: FormField and field name is not provided , only use for render() option in FormField
export default function SingleImageForm(
  {
    onChange,
    onBlur,
    value,
  }: {
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: File[];
  },
  fallbackUrl?: string,
  thing: "cover" | "avatar" = "cover"
) {
  const urls = useMultiObjectURLs(value);
  const coverPreview = urls.length > 0 ? urls[0] : fallbackUrl;

  return (
    <FormItem className={thing === "cover" ? " w-60" : "w-32"}>
      <FormLabel>{thing === "cover" ? "封面图片" : "头像"}</FormLabel>
      <FormControl>
        <div className={cn(thing==="cover" ? "h-60 rounded-md" : "h-32 rounded-full","w-full relative border aria-invalid:border-destructive bg-input/30")}>
          {coverPreview && (
            <Image
              fill
              className={cn(thing==="avatar" ? "rounded-full":"","object-cover")}
              src={coverPreview}
              alt="Cover Preview"
            />
          )}
          <div className="w-full h-full flex items-center justify-center">
            <span
              className={cn(
                "text-center z-10 text-sm",
                coverPreview
                  ? "bg-gray-500/30 text-white p-1 rounded-sm"
                  : "text-muted-foreground"
              )}
            >
              点击或拖拽以{coverPreview ? "替换" : "上传"}
              {thing === "cover" ? "封面" : "头像"}
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