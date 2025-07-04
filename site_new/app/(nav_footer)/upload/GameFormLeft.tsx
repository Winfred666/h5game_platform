"use client";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IGame, IGameTag } from "@/lib/types/igame";
import { genGameDownloadURL } from "@/lib/utils";
import { GameFormInputType } from "@/lib/types/zforms";
import SearchBar from "@/components/SearchBar";
import {
  DeletableTags,
  SelectableTags,
} from "@/components/inputs/InteractiveTag";
import { UserThumbnail } from "@/components/UserListItem";
import { IUser } from "@/lib/types/iuser";
import { InputWithLabel } from "@/components/inputs/InputWithLabel";
import { SelectWithLabel } from "@/components/inputs/SelectWithLabel";
import { TextAreaWithLabel } from "@/components/inputs/TextAreaWithLabel";
import { X } from "lucide-react";
import { toast } from "sonner";

interface GameFormLeftProps {
  allTags: IGameTag[]; // All available tags for the game
  form: UseFormReturn<GameFormInputType>;
  game?: IGame;
}

export function GameFormLeft({ allTags, game, form }: GameFormLeftProps) {
  const kindOfProject = form.watch("kind");
  const embedOpProject = form.watch("embed_op");
  // This function handles the logic for toggling a tag
  return (
    <div className="w-3/5 min-w-2/5 flex flex-col gap-6">
      <InputWithLabel<GameFormInputType>
        fieldTitle="标题"
        nameInSchema="title"
        placeholder="输入您的游戏名称"
      />

      <SelectWithLabel<GameFormInputType>
        fieldTitle="项目类型"
        nameInSchema="kind"
        placeholder="选择一个项目类型"
        data={[
          { id: "downloadable", description: "只下载" },
          { id: "html", description: "HTML (浏览器内可玩)" },
        ]}
      />

      {kindOfProject === "html" && (
        <div className=" flex flex-col gap-6">
          <SelectWithLabel<GameFormInputType>
            fieldTitle="在线显示模式"
            nameInSchema="embed_op"
            placeholder="选择在线显示方式"
            data={[
              { id: "embed_in_page", description: "内嵌在页面中" },
              { id: "fullscreen", description: "浏览器窗口全屏模式" },
            ]}
          />
          {embedOpProject === "embed_in_page" && (
            <div className=" space-y-2">
              <FormLabel>游戏窗口尺寸 (内嵌时)</FormLabel>
              <div className=" flex items-baseline justify-between  gap-1">
                <InputWithLabel<GameFormInputType>
                  nameInSchema="width"
                  placeholder="宽度"
                  type="number"
                />
                <span className="text-muted-foreground"> px </span>
                <X className=" grow relative top-1 icon-sm text-muted-foreground" />
                <InputWithLabel<GameFormInputType>
                  nameInSchema="height"
                  placeholder="高度"
                  type="number"
                />
                <span className="text-muted-foreground"> px </span>
              </div>
            </div>
          )}
        </div>
      )}

      <FormField
        name="uploadfile"
        render={({ field: { onChange, onBlur } }) => (
          <FormItem>
            <FormLabel>游戏文件</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".zip,.rar,.7zip"
                onChange={(e) => onChange(Array.from(e.target.files ?? []))}
                onBlur={onBlur}
              />
            </FormControl>
            <FormDescription>
              <span>
                上传 .zip 文件；在线游戏需根目录内含 index.html；最大体积：1GB；
              </span>
              {game && (
                <span>
                  当前文件:
                  <a href={genGameDownloadURL(game.id)}>
                    {genGameDownloadURL(game.id)}
                  </a>
                  ；上传新文件将会替换它。
                </span>
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      ></FormField>

      <TextAreaWithLabel<GameFormInputType>
        fieldTitle="游戏描述"
        nameInSchema="description"
        placeholder="描述游戏的游玩方法、特性和背景故事..."
      />

      <FormField
        control={form.control}
        name="developers"
        render={({ field: { value, onChange, onBlur } }) => (
          <FormItem>
            <FormLabel>开发者列表</FormLabel>
            <FormControl>
              <div
                className=" flex flex-col gap-2"
                style={{
                  "--cmdk-list-height": "300px", // Adjust height as needed
                } as any}
              >
                <DeletableTags
                  onDelete={(tagId) =>
                    onChange(value.filter((dev) => dev.id !== tagId))
                  }
                  selectedTags={value}
                  emptyText="没有选择开发者"
                />
                <SearchBar
                  thing="user"
                  onSelect={(user) => {
                    if (value.some((dev) => dev.id === user.id)) {
                      toast.warning("开发者已存在于列表中");
                    } else {
                      onChange([...value, user]);
                    }
                  }}
                  onBlur={onBlur}
                  renderListItem={(user) => (
                    <UserThumbnail user={user as IUser} />
                  )}
                  listClassName=" max-h-60"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- REWRITTEN TAGS FIELD --- */}
      <FormField
        control={form.control}
        name="tags"
        render={({ field: { value, onChange } }) => (
          <FormItem>
            <FormLabel>游戏标签</FormLabel>
            <FormControl>
              <SelectableTags
                allTags={allTags}
                selectedTagIds={value}
                onSelect={(tagId) => onChange([...value, tagId])}
                onCancel={(tagId) =>
                  onChange(value.filter((id) => id !== tagId))
                }
              />
            </FormControl>
            <FormDescription>点击标签来选择或取消选择。</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
