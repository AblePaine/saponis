import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { OIL_DATABASE } from "@/data/oils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRecipeStore } from "@/lib/recipe-store";

export function OilPicker() {
  const oils = useRecipeStore((s) => s.config.oils);
  const addOil = useRecipeStore((s) => s.addOil);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const usedIds = oils.map((row) => row.oilId).join(",");
  const available = useMemo(() => {
    const used = new Set(usedIds.split(",").filter(Boolean));
    const needle = query.trim().toLowerCase();
    return OIL_DATABASE.filter((oil) => {
      if (used.has(oil.id)) return false;
      if (!needle) return true;
      return (
        oil.name.toLowerCase().includes(needle) ||
        oil.common_botanical_name.toLowerCase().includes(needle) ||
        oil.inci_names.standard.toLowerCase().includes(needle) ||
        oil.slug.includes(needle)
      );
    });
  }, [query, usedIds]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="lg" className="w-full">
          <Plus />
          Add oil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Oil library</DialogTitle>
          <DialogDescription>Search the workhorse fats and add one to the batch.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or INCI"
            className="h-12 pl-10"
            autoFocus
          />
        </div>
        <ul className="mt-3 min-h-0 flex-1 overflow-y-auto">
          {available.length === 0 ? (
            <li className="px-1 py-8 text-center text-sm text-muted">
              {oils.length === OIL_DATABASE.length
                ? "Every oil in the library is already on the bench."
                : "No match in this library."}
            </li>
          ) : (
            available.map((oil) => (
              <li key={oil.id} className="border-b border-line last:border-0">
                <div className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{oil.name}</p>
                    <p className="truncate text-xs text-muted italic">
                      {oil.common_botanical_name}
                    </p>
                  </div>
                  <Link
                    to="/oils/$slug"
                    params={{ slug: oil.slug }}
                    className="flex h-12 items-center px-2 text-xs font-medium text-primary"
                    onClick={() => setOpen(false)}
                  >
                    Spec
                  </Link>
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 px-3"
                    onClick={() => {
                      addOil(oil.id);
                      setOpen(false);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
