"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IndustrySelectorProps {
  industries: Industry[];
  selectedIndustryId?: string;
  onIndustryChange: (industryId: string) => void;
  disabled?: boolean;
}

export function IndustrySelector({ 
  industries, 
  selectedIndustryId, 
  onIndustryChange, 
  disabled = false 
}: IndustrySelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedIndustry = industries.find(
    (industry) => industry.id === selectedIndustryId
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Industry Category
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedIndustry && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {selectedIndustry ? selectedIndustry.name : "Select industry..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search industries..." 
              className="h-9"
            />
            <CommandEmpty>No industry found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {industries.map((industry) => (
                <CommandItem
                  key={industry.id}
                  value={industry.name}
                  onSelect={() => {
                    onIndustryChange(industry.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedIndustryId === industry.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{industry.name}</span>
                    {industry.description && (
                      <span className="text-sm text-muted-foreground">
                        {industry.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedIndustry?.description && (
        <p className="text-xs text-muted-foreground">
          {selectedIndustry.description}
        </p>
      )}
    </div>
  );
}

export function IndustrySelectorSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-full bg-gray-200 rounded border animate-pulse" />
    </div>
  );
}