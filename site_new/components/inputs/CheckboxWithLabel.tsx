"use client";

import { useFormContext, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "../ui/checkbox";

// Use a generic `TFieldValues` that extends what react-hook-form expects.
type Props<TFieldValues extends FieldValues> = {
  nameInSchema: Path<TFieldValues>;
  label: string;
  description?: string;
};

export function CheckboxWithLabel<TFieldValues extends FieldValues>({
  nameInSchema,
  label,
  description,
}: Props<TFieldValues>) {
  const form = useFormContext<TFieldValues>();

  return (
    <FormField
      control={form.control}
      name={nameInSchema}
      render={({ field }) => (
        <FormItem
          className="flex flex-row items-start 
        gap-3 rounded-md border p-4"
        >
          <FormControl>
            {/* The Checkbox component gets the `checked` and `onCheckedChange` props */}
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
}
