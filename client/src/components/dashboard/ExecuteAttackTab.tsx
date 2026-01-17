import { useState, useEffect } from "react";
import { Crosshair, Users, Mail, Phone, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ExecuteAttackTabProps {
  targetName: string;
  isEnabled: boolean;
}

interface CompanyOSINTData {
  osint_data: {
    company_name?: string;
    data?: any;
    keyPersonnel?: Array<{
      name: string;
      role: string;
      email: string;
      phone?: string;
      linkedin?: string;
      instagram?: string;
    }>;
  };
  created_at: string;
  last_updated: string;
}

export default function ExecuteAttackTab({
  targetName,
  isEnabled,
}: ExecuteAttackTabProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [osintData, setOsintData] = useState<CompanyOSINTData | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  // Fetch employee list on component mount or when enabled/targetName changes
  useEffect(() => {
    const fetchEmployeeList = async () => {
      if (!isEnabled || !targetName) return;
      
      setIsFetchingData(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/osint/company/${encodeURIComponent(targetName)}`
        );
        
        if (response.ok) {
          const result = await response.json();
          const data = result.data;
          
          // Extract personnel data
          const personnelData = data?.osint_data?.keyPersonnel || data?.osint_data?.data?.keyPersonnel;
          if (personnelData && personnelData.length > 0) {
            setEmployeeList(personnelData);
          }
        }
      } catch (error) {
        console.error("[REVEL8] Error fetching employee list:", error);
      } finally {
        setIsFetchingData(false);
      }
    };
    
    fetchEmployeeList();
  }, [isEnabled, targetName]);

  const fetchCompanyOSINTData = async () => {
    setIsFetchingData(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/osint/company/${encodeURIComponent(targetName)}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("No OSINT data found", {
            description: `No data available for ${targetName}. Please complete OSINT reconnaissance first.`,
          });
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`[REVEL8] Retrieved OSINT data for ${targetName}:`, result);
      toast.success("OSINT data loaded", {
        description: `Successfully retrieved data for ${targetName}`,
      });
      
      return result.data;
    } catch (error) {
      console.error("[REVEL8] Error fetching OSINT data:", error);
      toast.error("Failed to fetch OSINT data", {
        description: "Could not retrieve stored reconnaissance data.",
      });
      return null;
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleExecuteAttack = async () => {
    if (!isEnabled) return;
    setIsExecuting(true);
    
    // Fetch the stored OSINT data
    const data = await fetchCompanyOSINTData();
    
    if (data) {
      setOsintData(data);
      console.log(`[REVEL8] Executing multi-channel attack on target: ${targetName}`);
      console.log(`[REVEL8] Available data:`, data);
      
      // Check if we have personnel data
      const personnelData = data.osint_data?.keyPersonnel || data.osint_data?.data?.keyPersonnel;
      if (personnelData && personnelData.length > 0) {
        toast.success("Attack vectors identified", {
          description: `Found ${personnelData.length} target(s) with contact information`,
        });
      }
      
      // Simulate attack execution
      setTimeout(() => {
        setIsExecuting(false);
        toast.success("Attack execution complete", {
          description: "Multi-channel attack vectors have been deployed.",
        });
      }, 3000);
    } else {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-light tracking-wide text-foreground flex items-center justify-center gap-2">
          <Crosshair className="h-6 w-6 text-primary" />
          Execute Attack
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Multi-channel attack execution against{" "}
          <span className="text-primary">{targetName}</span>
        </p>
      </div>

      {/* Status Card */}
      <Card className="bg-card/50 border-border/50 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-base font-medium">Attack Status</CardTitle>
          <CardDescription>
            {isEnabled
              ? "OSINT data complete. Ready to execute."
              : "Complete OSINT reconnaissance before executing attack."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isEnabled
                  ? "bg-green-500 animate-pulse"
                  : "bg-muted-foreground/50"
              }`}
            />
            <span
              className={`text-sm uppercase tracking-wider ${
                isEnabled ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {isEnabled ? "Ready" : "Not Ready"}
            </span>
          </div>

          {/* Execute Button */}
          <Button
            onClick={handleExecuteAttack}
            disabled={!isEnabled || isExecuting || isFetchingData}
            size="lg"
            className={`w-full h-14 text-sm tracking-widest uppercase font-medium transition-all duration-300 ${
              isEnabled
                ? "bg-primary/90 hover:bg-primary hover:glow-purple-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isExecuting || isFetchingData ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                {isFetchingData ? "Loading Data..." : "Executing..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Crosshair className="h-4 w-4" />
                Execute Multi-Channel Attack
              </span>
            )}
          </Button>

          {!isEnabled && (
            <p className="text-xs text-muted-foreground text-center">
              Navigate to the OSINT Engine tab to complete reconnaissance
            </p>
          )}
        </CardContent>
      </Card>

      {/* Employee List - Display when enabled */}
      {isEnabled && employeeList.length > 0 && (
        <Card className="bg-card/50 border-border/50 w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Company Employees ({employeeList.length})
            </CardTitle>
            <CardDescription>
              Target personnel identified from reconnaissance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {employeeList.map((person: any, idx: number) => (
              <div key={idx}>
                <div className="flex items-center justify-between py-3 gap-6">
                  {/* Left: Name and Role */}
                  <div className="flex-shrink-0 w-64">
                    <p className="text-sm font-medium text-foreground">
                      {person.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {person.role}
                    </p>
                  </div>

                  {/* Middle: Contact Information */}
                  <div className="flex-1 flex items-center gap-4 min-w-0 overflow-hidden">
                    {person.email && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="font-mono truncate">{person.email}</span>
                      </div>
                    )}
                    {person.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                        <Phone className="h-3 w-3" />
                        <span className="font-mono">{person.phone}</span>
                      </div>
                    )}
                    {person.linkedin && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <span className="font-mono truncate">{person.linkedin}</span>
                      </div>
                    )}
                    {person.instagram && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                        <Instagram className="h-3 w-3" />
                        <span className="font-mono">@{person.instagram}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Risk Level Badge */}
                  {person.riskLevel && (
                    <Badge
                      variant={
                        person.riskLevel === "high"
                          ? "destructive"
                          : person.riskLevel === "medium"
                          ? "outline"
                          : "secondary"
                      }
                      className={`uppercase tracking-wider flex-shrink-0 ${
                        person.riskLevel === "medium"
                          ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                          : person.riskLevel === "low"
                          ? "bg-green-500/20 text-green-500 border-green-500/30"
                          : ""
                      }`}
                    >
                      {person.riskLevel}
                    </Badge>
                  )}
                </div>
                {idx < employeeList.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* OSINT Data Display */}
      {osintData && (
        <Card className="bg-card/50 border-border/50 w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Retrieved OSINT Data
            </CardTitle>
            <CardDescription>
              Data loaded from reconnaissance phase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p className="text-foreground font-mono">
                  {new Date(osintData.last_updated).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="text-foreground font-mono">
                  {new Date(osintData.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Personnel Data */}
            {osintData.osint_data?.keyPersonnel && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Target Personnel ({osintData.osint_data.keyPersonnel.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {osintData.osint_data.keyPersonnel.map((person: any, idx: number) => (
                    <Card key={idx} className="bg-background/50 border-border/30">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {person.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {person.role}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          {person.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="font-mono">{person.email}</span>
                            </div>
                          )}
                          {person.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">{person.phone}</span>
                            </div>
                          )}
                          {person.instagram && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Instagram className="h-3 w-3" />
                              <span className="font-mono">@{person.instagram}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data Preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                Raw Data Preview
              </h3>
              <pre className="text-xs bg-background/50 p-3 rounded border border-border/30 overflow-x-auto max-h-48 overflow-y-auto font-mono">
                {JSON.stringify(osintData.osint_data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
