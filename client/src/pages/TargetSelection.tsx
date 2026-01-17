import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AnimatedPurpleBackground from "@/components/AnimatedPurpleBackground";
import CryptographicWaterfallBackground from "@/components/CryptographicWaterfallBackground";
import { ChevronDown, Loader2, RefreshCw } from "lucide-react";

interface Company {
  name: string;
  domain?: string;
  logo?: string | null;
}

interface TargetSelectionProps {
  selectedTarget: string;
  onTargetChange: (target: string) => void;
  onPenetrate: () => void;
}

const SEC_API_URL = "http://localhost:8000/api/v1/sec/companies";
const CLEARBIT_API_URL = "https://autocomplete.clearbit.com/v1/companies/suggest";
const PRELOADED_COMPANIES_COUNT = 50;

export default function TargetSelection({
  selectedTarget,
  onTargetChange,
  onPenetrate,
}: TargetSelectionProps) {
  const [preloadedCompanies, setPreloadedCompanies] = useState<Company[]>([]);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch top 50 companies from SEC API on mount
  const fetchPreloadedCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(SEC_API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data = await response.json();
      // Transform the object into an array of companies and take top 50
      const companyArray: Company[] = Object.values(data)
        .slice(0, PRELOADED_COMPANIES_COUNT)
        .map((c: unknown) => {
          const company = c as { cik_str: number; ticker: string; title: string };
          return {
            name: company.title,
            domain: undefined,
            logo: null,
          };
        });
      setPreloadedCompanies(companyArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  // Search companies using Clearbit API
  const searchCompanies = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`${CLEARBIT_API_URL}?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    fetchPreloadedCompanies();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCompanies(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCompanies]);

  const handlePenetrate = () => {
    if (selectedTarget) {
      console.log(`[REVEL8] Initiating penetration sequence on target: ${selectedTarget}`);
      onPenetrate();
    } else {
      console.log("[REVEL8] No target selected");
    }
  };

  const handleSelectCompany = (companyName: string) => {
    onTargetChange(companyName);
    setOpen(false);
    setSearchQuery("");
  };

  // Determine which companies to display
  const displayedCompanies = searchQuery.trim().length > 0 ? searchResults : preloadedCompanies;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <AnimatedPurpleBackground />
      <CryptographicWaterfallBackground hideBackground className="z-[3]" />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-7xl px-4">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-light tracking-[0.4em] text-foreground/90">
            REVEL<span className="text-primary text-glow-purple">8</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        {/* Control Panel */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Target Selector */}
          <div className="w-full max-w-2xl">
            <label className="block w-full text-xs text-muted-foreground mb-2 tracking-wider uppercase">
              Select Target
            </label>
            
            {error ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPreloadedCompanies}
                  className="gap-2"
                >
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              </div>
            ) : (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-12 justify-between bg-card/50 border-border/50 hover:border-primary/30 transition-colors font-normal"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading companies...
                      </span>
                    ) : selectedTarget ? (
                      <span className="truncate">{selectedTarget}</span>
                    ) : (
                      <span className="text-muted-foreground">Search companies...</span>
                    )}
                    <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-border/50"
                  align="start"
                >
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Type to search..." 
                      className="h-10"
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {searching ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : displayedCompanies.length === 0 && searchQuery.trim().length > 0 ? (
                        <CommandEmpty>No companies found.</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {displayedCompanies.map((company, index) => (
                            <CommandItem
                              key={`${company.name}-${index}`}
                              value={company.name}
                              onSelect={handleSelectCompany}
                              className="cursor-pointer hover:bg-primary/10 data-[selected=true]:bg-primary/10 flex items-center justify-between"
                            >
                              <span className="truncate">{company.name}</span>
                              {company.domain && (
                                <span className="text-muted-foreground text-sm ml-2 shrink-0">
                                  ({company.domain})
                                </span>
                              )}
                            </CommandItem>
                          ))}
                          {!searchQuery && displayedCompanies.length > 0 && (
                            <div className="py-2 px-2 text-xs text-muted-foreground text-center border-t border-border/30">
                              Showing top {PRELOADED_COMPANIES_COUNT} companies. Type to search more...
                            </div>
                          )}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Penetrate Button */}
          <Button
            onClick={handlePenetrate}
            disabled={!selectedTarget}
            className="w-full max-w-xs h-12 text-sm tracking-widest uppercase font-medium bg-primary/90 hover:bg-primary hover:glow-purple-sm transition-all duration-300 disabled:opacity-30 disabled:hover:bg-primary/90"
          >
            Penetrate
          </Button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
          <span className="tracking-wider">
            {loading ? "LOADING DATA..." : error ? "CONNECTION ERROR" : "SYSTEM READY"}
          </span>
        </div>
      </div>
    </div>
  );
}
