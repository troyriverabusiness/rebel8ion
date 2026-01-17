import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AnimatedPurpleBackground from "@/components/AnimatedPurpleBackground";
import CryptographicWaterfallBackground from "@/components/CryptographicWaterfallBackground";
import { ChevronDown, Loader2 } from "lucide-react";

interface Company {
  name: string;
  domain: string;
  logo: string | null;
}

interface TargetSelectionProps {
  selectedTarget: string;
  onTargetChange: (target: string) => void;
  onPenetrate: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TargetSelection({
  selectedTarget,
  onTargetChange,
  onPenetrate,
}: TargetSelectionProps) {
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Search companies using backend proxy
  const searchCompanies = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const url = `${API_BASE_URL}/api/v1/companies/search?query=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      const data: Company[] = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCompanies(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCompanies]);

  const handlePenetrate = async () => {
    if (selectedTarget) {
      console.log(`[REVEL8] Initiating penetration sequence on target: ${selectedTarget}`);
      
      // Send company name to server, which will forward to webhook
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/target/select`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_name: selectedTarget }),
        });
        
        if (!response.ok) {
          console.error('[REVEL8] Failed to send target to webhook:', response.status);
        } else {
          const data = await response.json();
          console.log('[REVEL8] Target successfully sent to webhook:', data);
        }
      } catch (error) {
        console.error('[REVEL8] Error sending target to webhook:', error);
      }
      
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
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full h-12 justify-between bg-card border-border hover:border-primary/70 transition-colors font-normal"
                >
                  {selectedTarget ? (
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
                <div className="flex items-center border-b px-3">
                  <input
                    type="text"
                    placeholder="Type to search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {searching ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchQuery.trim().length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Start typing to search companies...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No companies found.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((company, index) => (
                        <button
                          key={`${company.domain}-${index}`}
                          onClick={() => handleSelectCompany(company.name)}
                          className="w-full flex items-center justify-between px-2 py-2 text-sm rounded-sm hover:bg-primary/10 focus:bg-primary/10 outline-none cursor-pointer"
                        >
                          <span className="truncate">{company.name}</span>
                          <span className="text-muted-foreground text-sm ml-2 shrink-0">
                            ({company.domain})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
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
          <span className="tracking-wider">SYSTEM READY</span>
        </div>
      </div>
    </div>
  );
}
