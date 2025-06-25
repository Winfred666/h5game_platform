"use client";

// 目前唯一使用 API 的组件
import useSearchOptions_debounce from "@/lib/hooks/useSearchOptions";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { CommandEmpty, CommandLoading } from "cmdk";
import { useState } from "react";
import { IGame } from "@/lib/types/igame";
import { IUser } from "@/lib/types/iuser";

type OptionType = IGame | IUser;
export default function SearchBar({
  thing,
  renderListItem,
  onSelect,
  onEnter,
}: {
  thing: "game" | "user";
  renderListItem: (item: OptionType) => React.ReactNode;
  onSelect?: (selectOption: OptionType) => void;
  onEnter?: (searchTerm: string) => void;
}) {
  const { searchOptions, searchTerm, setSearchTerm, isLoading } =
    useSearchOptions_debounce("game");
  const [showList, setShowList] = useState(false);

  return (
    <div className="relative grow">
      <div className=" relative lg:w-3/5">
      <Command className=" border bg-popover">
        <CommandInput
          placeholder={
            thing === "game" ? "搜索游戏名称..." : "搜索用户名称或QQ..."
          }
          onValueChange={(content) => {
            setSearchTerm(content);
          }}
          onKeyDown={
            onEnter
              ? (e) => {
                  e.preventDefault();
                  if (e.key === "Enter" && onEnter && searchTerm) {
                    onEnter(searchTerm);
                  }
                }
              : undefined
          }
          onFocus={() => setShowList(true)}
        />  
        {/* not show command list when not focus on command input */}
        <CommandList hidden={!showList} className=" h-fit absolute top-full bg-popover w-full shadow-sm">
          {searchOptions.map((option: OptionType) => (
            <CommandItem
              key={option.id}
              onSelect={
                onSelect
                  ? () => {
                      onSelect(option);
                    }
                  : undefined
              }
            >
              {renderListItem(option)}
            </CommandItem>
          ))}

          {isLoading ? (
            <CommandLoading>正在搜索...</CommandLoading>
          ) : (
            searchTerm.length > 0 &&
            searchOptions.length === 0 && (
              <CommandEmpty className=" text-muted-foreground">
                {thing === "game" ? "未搜索到游戏" : "未搜索到用户"}
              </CommandEmpty>
            )
          )}

        </CommandList>
        {/* command list should be popped up when focus */}
      </Command>
      </div>
    </div>
  );
}
