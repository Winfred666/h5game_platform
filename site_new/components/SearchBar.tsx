"use client";

// 目前唯一使用 API 的组件
import useSearchOptions_debounce from "@/lib/hooks/useSearchOptions";
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command";
import { CommandEmpty, CommandLoading } from "cmdk";
import { useState } from "react";
import { IGame } from "@/lib/types/igame";
import { IUser } from "@/lib/types/iuser";
import { useOutsideClick } from "@/lib/hooks/useBrowser";

type OptionType = IGame | IUser;
export default function SearchBar({
  thing,
  renderListItem,
  onSelect,
  onEnter,
  onBlur,
}: {
  thing: "game" | "user";
  renderListItem: (item: OptionType) => React.ReactNode;
  onSelect?: (selectOption: OptionType) => void;
  onEnter?: (searchTerm: string) => void;
  onBlur?: () => void;
}) {
  const { searchOptions, searchTerm, setSearchTerm, isLoading } =
    useSearchOptions_debounce(thing);
  const [showList, setShowList] = useState(false);

  // use click outside to close the list
  const outsideRef = useOutsideClick(() => {
    setShowList(false);
  });

  console.log("searchOptions", searchOptions, showList);

  return (
    <div className="relative grow">
      <div className=" relative lg:w-3/5">
        <Command shouldFilter={false} className=" border bg-popover">
          <CommandInput
            placeholder={
              thing === "game" ? "搜索游戏名称..." : "搜索用户名称或QQ..."
            }
            onValueChange={(content) => {
              setSearchTerm(content);
            }}
            onFocus={() => setShowList(true)}
            onBlur={onBlur ?? undefined}
            ref={outsideRef}
          />
          {/* not show command list when not focus on command input */}
          <CommandList
            hidden={!showList}
            className=" h-fit absolute top-full bg-popover w-full shadow-sm"
          >
            {/* Default when no select */}
            <CommandItem
              value="-"
              className="hidden"
              onSelect={
                onEnter
                  ? (e) => {
                      setShowList(false);
                      outsideRef.current?.blur();
                      searchTerm && onEnter(searchTerm);
                    }
                  : undefined
              }
            />
            {searchOptions.map((option: OptionType) => (
              <CommandItem
                key={thing+option.id}
                onSelect={() => {
                  setShowList(false);
                  outsideRef.current?.blur(); // close the list when select an option
                  onSelect && onSelect(option);
                }}
              >
                {renderListItem(option)}
              </CommandItem>
            ))}
            <div className=" text-muted-foreground w-full text-center my-2">
              {isLoading ? (
                <CommandLoading>正在搜索...</CommandLoading>
              ) : (
                searchTerm.length > 0 &&
                searchOptions.length === 0 && (
                  <CommandEmpty>
                    {thing === "game" ? "未搜索到游戏" : "未搜索到用户"}
                  </CommandEmpty>
                )
              )}
            </div>
          </CommandList>
          {/* command list should be popped up when focus */}
        </Command>
      </div>
    </div>
  );
}
