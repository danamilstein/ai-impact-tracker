import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const CATEGORY_ORDER = [
  "code",
  "image",
  "audio",
  "video",
  "text",
  "multimodal",
  "productivity",
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  text: "Text",
  code: "Code",
  image: "Image",
  audio: "Audio",
  video: "Video",
  multimodal: "Multimodal",
  productivity: "Productivity",
};

export type ToolPickerTool = {
  id: number;
  name: string;
  provider: string;
  category: string;
};

type ToolPickerProps = {
  tools: ToolPickerTool[];
  value: string | undefined;
  onChange: (id: string) => void;
  loading?: boolean;
  placeholder?: string;
  loadingLabel?: string;
  emptyLabel?: string;
  className?: string;
};

export function ToolPicker({
  tools,
  value,
  onChange,
  loading = false,
  placeholder = "Search or select a tool...",
  loadingLabel = "Loading tools…",
  emptyLabel = "No tools available",
  className,
}: ToolPickerProps) {
  const [open, setOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, ToolPickerTool[]>();
    for (const tool of tools) {
      const list = map.get(tool.category) ?? [];
      list.push(tool);
      map.set(tool.category, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    const ordered = CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c as string,
      tools: map.get(c)!,
    }));
    // Append any uncategorised buckets at the end so we don't silently drop tools.
    for (const [category, list] of map.entries()) {
      if (!CATEGORY_ORDER.includes(category as (typeof CATEGORY_ORDER)[number])) {
        ordered.push({ category, tools: list });
      }
    }
    return ordered;
  }, [tools]);

  const selectedTool = tools.find((t) => t.id.toString() === value);

  if (loading || tools.length === 0) {
    return (
      <div
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground",
          className,
        )}
        aria-label={loading ? loadingLabel : emptyLabel}
      >
        {loading ? loadingLabel : emptyLabel}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !selectedTool && "text-muted-foreground",
            className,
          )}
        >
          {selectedTool ? (
            <span className="truncate">
              {selectedTool.name}
              <span className="text-muted-foreground ml-2">
                ({selectedTool.provider})
              </span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          filter={(itemValue, search) => {
            if (!search) return 1;
            return itemValue.toLowerCase().includes(search.toLowerCase())
              ? 1
              : 0;
          }}
        >
          <CommandInput placeholder="Search by tool or provider..." />
          <CommandList className="max-h-72">
            <CommandEmpty>No tools found.</CommandEmpty>
            {grouped.map(({ category, tools: catTools }, idx) => (
              <div key={category}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup
                  heading={CATEGORY_LABEL[category] ?? category}
                >
                  {catTools.map((tool) => (
                    <CommandItem
                      key={tool.id}
                      value={`${tool.name} ${tool.provider}`}
                      onSelect={() => {
                        onChange(tool.id.toString());
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === tool.id.toString()
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <span className="truncate">
                        {tool.name}
                        <span className="text-muted-foreground ml-2">
                          ({tool.provider})
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
