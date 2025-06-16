"use client";

import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { styled, alpha } from "@mui/material/styles";
import { Autocomplete, CircularProgress } from "@mui/material";
import {
  useSearchOptions,
  useSearchOptions_debounce,
} from "@/hooks/useSearchOptions";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "20ch",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "36ch",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
}));

type OptionType = { label: string; id: string };

export default function SearchBar({
  placeholder,
  thing,
  processOptionFunc,
  onSelect,
  onEnter,
}: {
  placeholder: string;
  thing: "game" | "user";
  processOptionFunc: (options: any) => OptionType;
  onSelect: (selectOption: OptionType) => void;
  onEnter?: (searchTerm: string) => void;
}) {
  const { searchOptions, searchTerm, setSearchTerm, isLoading } =
  useSearchOptions(thing);
  // console.log("SearchBar", searchOptions, searchTerm, isLoading);
  return (
    <Autocomplete
      options={searchOptions.map(processOptionFunc)}
      getOptionKey={(option: OptionType) => "search_" + option.id}
      onChange={(event: any, newVal: OptionType | null) => {
        if (newVal) onSelect(newVal);
      }}
      disablePortal
      renderInput={(params) => {
        // Extract MUI props before passing to InputBase
        const { InputLabelProps, InputProps, ...rest } = params;
        return (
          <Search>
            <SearchIconWrapper>
              {isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
            </SearchIconWrapper>
            <StyledInputBase
              {...rest}
              {...InputProps} // Pass MUI input props to InputBase
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onEnter && searchTerm) {
                  onEnter(searchTerm);
                }
              }}
            />
          </Search>
        );
      }}
    />
  );
}
