import * as React from "react"

import { cn } from "@/lib/utils"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from "./button";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  // help adding type="password" eyes
  const [showPassword, setShowPassword] = React.useState(false);

  const BaseInput = (
    <input
      type={type === "password" ? (showPassword ? "text" : "password") : type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
        type === "file" && "cursor-pointer"
      )}
      {...props}
    />
  );

  if (type === "password") {
    return (
      <div className="relative flex items-center">
        {BaseInput}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
        >
				{showPassword ? (
					<EyeIcon className="h-4 w-4" aria-hidden="true" />
				) : (
					<EyeOffIcon className="h-4 w-4" aria-hidden="true" />
				)}
				<span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
			</Button>
      </div>
    );
  } else {
    return BaseInput;
  }

}

export { Input }
