// 目前唯一使用 API 的组件
import useSearchOptions_debounce from "@/lib/hooks/useSearchOptions";
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command";
import { CommandEmpty, CommandLoading } from "cmdk";
import { useEffect, useRef, useState } from "react";
import { useOutsideClick } from "@/lib/hooks/useBrowser";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function SearchBar<OptionType extends {id:string}>({
  thing,
  renderListItem,
  onSelect,
  onEnter,
  onBlur,
  className = "",
  listClassName = "",
  disabled,
}: {
  thing: "game" | "user";
  renderListItem: (item: OptionType) => React.ReactNode;
  onSelect?: (selectOption: OptionType) => void;
  onEnter?: (searchTerm: string) => void;
  onBlur?: () => void;
  className?: string; // for custom styling
  listClassName?: string; // for custom styling of the list
  disabled?: boolean
}) {
  const { searchOptions, searchTerm, setSearchTerm, isLoading } =
    useSearchOptions_debounce(thing);
  const [showList, setShowList] = useState(false);

  // use click outside to close the list
  const outsideRef = useOutsideClick(() => {
    setShowList(false);
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const closeSearchBar = () => {
    setShowList(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearchBar();
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  });

  // console.log("searchOptions", searchOptions, showList);

  return (
    <div className="relative grow" ref={outsideRef}>
      <div className={cn("relative", className)}>
        <Command shouldFilter={false} className=" border bg-popover">
          <CommandInput
            placeholder={
              thing === "game" ? "搜索游戏名称..." : "搜索用户名称或QQ..."
            }
            onValueChange={(content) => {
              setSearchTerm(content);
            }}
            disabled={disabled}
            onFocus={() => setShowList(true)}
            onBlur={onBlur ?? undefined}
            ref={inputRef}
          />
          {/* not show command list when not focus on command input */}
          <CommandList
            hidden={!showList}
            className={cn(
              "h-fit absolute top-full bg-popover w-full shadow-sm",
              listClassName
            )}
          >
            <div className=" text-muted-foreground w-full text-center my-2">
              {searchTerm.length > 0 && (isLoading ? (
                <CommandLoading asChild className=" flex flex-row gap-2 justify-center">
                    <Loader2 className="animate-spin" />
                  <div>正在搜索...</div>
                </CommandLoading>
              ) : (
                searchOptions.length === 0 && (
                  <CommandEmpty>
                    {thing === "game" ? "未搜索到游戏" : "未搜索到用户"}
                  </CommandEmpty>
                )
              ))}
            </div>
            {/* Default when no select */}
            <CommandItem
              value="-"
              className="hidden"
              onSelect={
                onEnter
                  ? () => {
                      if(thing === "game") closeSearchBar(); // game:close the list when select an option
                      if(searchTerm) onEnter(searchTerm);
                    }
                  : undefined
              }
            />
            {searchOptions.map((option: OptionType) => (
              <CommandItem
                key={thing + option.id}
                onSelect={() => {
                  if(thing === "game") closeSearchBar(); // game:close the list when select an option
                  if(onSelect) onSelect(option);
                }}
              >
                {renderListItem(option)}
              </CommandItem>
            ))}
          </CommandList>
          {/* command list should be popped up when focus */}
        </Command>
      </div>
    </div>
  );
}
