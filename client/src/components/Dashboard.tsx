import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
  Crosshair,
  Building2,
  Users,
  Shield,
  Globe,
  Code,
  AlertTriangle,
  Target,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  getOSINTData,
  ACTIVITY_LOG,
  type OSINTData,
} from "@/data/mockData";
import AnimatedPurpleBackground from "@/components/AnimatedPurpleBackground";

type TabType = "overview" | "osint" | "attack";

interface DashboardProps {
  targetName: string;
  onBack: () => void;
}

export default function Dashboard({ targetName, onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const osintData = getOSINTData(targetName);

  const navItems = [
    { id: "overview" as TabType, label: "Overview", icon: LayoutDashboard },
    { id: "osint" as TabType, label: "OSINT Engine", icon: Search },
    { id: "attack" as TabType, label: "Execute Attack", icon: Crosshair },
  ];

  const isOsintComplete = osintData?.osintCompletionPercentage === 100;

  return (
    <div className="min-h-screen w-full flex bg-background">
      <AnimatedPurpleBackground />

      {/* Collapsible Sidebar */}
      <Collapsible
        open={!sidebarCollapsed}
        onOpenChange={(open) => setSidebarCollapsed(!open)}
        className="relative z-10"
      >
        <div
          className={`h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-56"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between">
            <CollapsibleContent>
              <h2 className="text-sm font-medium tracking-wider text-foreground/80">
                REVEL<span className="text-primary text-glow-purple">8</span>
              </h2>
            </CollapsibleContent>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Target Info */}
          <div className="p-4">
            <CollapsibleContent>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Target
              </p>
            </CollapsibleContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {sidebarCollapsed ? (
                <span className="text-xs text-primary font-medium">
                  {targetName.charAt(0)}
                </span>
              ) : (
                <span className="text-sm text-primary font-medium">
                  {targetName}
                </span>
              )}
            </div>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Navigation */}
          <nav className="flex-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDisabled =
                item.id === "attack" && !isOsintComplete;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start mb-1 ${
                    sidebarCollapsed ? "px-0 justify-center" : ""
                  } ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  onClick={() => !isDisabled && setActiveTab(item.id)}
                  disabled={isDisabled}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-2"}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Back Button */}
          <div className="p-2 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className={`w-full justify-start text-muted-foreground hover:text-foreground ${
                sidebarCollapsed ? "px-0 justify-center" : ""
              }`}
              onClick={onBack}
              title={sidebarCollapsed ? "Back to Target Selection" : undefined}
            >
              <ArrowLeft
                className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-2"}`}
              />
              {!sidebarCollapsed && <span className="text-sm">Back</span>}
            </Button>
          </div>
        </div>
      </Collapsible>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-hidden">
        <ScrollArea className="h-screen">
          <div className="p-6">
            {activeTab === "overview" && (
              <OverviewTab targetName={targetName} osintData={osintData} />
            )}
            {activeTab === "osint" && osintData && (
              <OSINTEngineTab osintData={osintData} />
            )}
            {activeTab === "attack" && (
              <ExecuteAttackTab
                targetName={targetName}
                isEnabled={isOsintComplete}
              />
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  targetName,
  osintData,
}: {
  targetName: string;
  osintData: OSINTData | null;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-wide text-foreground">
          Mission Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Active operation against{" "}
          <span className="text-primary">{targetName}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">
              OSINT Status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-light">
                {osintData?.osintCompletionPercentage || 0}%
              </span>
              <Badge
                variant={
                  osintData?.osintCompletionPercentage === 100
                    ? "default"
                    : "secondary"
                }
                className="bg-primary/20 text-primary border-0"
              >
                {osintData?.osintCompletionPercentage === 100
                  ? "Complete"
                  : "In Progress"}
              </Badge>
            </div>
            <Progress
              value={osintData?.osintCompletionPercentage || 0}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">
              Vulnerabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-light">
                {osintData?.vulnerabilities.length || 0}
              </span>
              <AlertTriangle className="h-5 w-5 text-destructive/70" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Discovered</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">
              Attack Vectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-light">
                {osintData?.attackVectors.length || 0}
              </span>
              <Target className="h-5 w-5 text-primary/70" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Identified</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider">
              Key Personnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-light">
                {osintData?.keyPersonnel.length || 0}
              </span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Profiled</p>
          </CardContent>
        </Card>
      </div>

      {/* Target Summary & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Summary */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Target Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {osintData && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Company
                  </p>
                  <p className="text-sm text-foreground">
                    {osintData.companyProfile.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Domain
                  </p>
                  <p className="text-sm text-primary">
                    {osintData.companyProfile.domain}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Industry
                  </p>
                  <p className="text-sm text-foreground">
                    {osintData.companyProfile.industry}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Employees
                  </p>
                  <p className="text-sm text-foreground">
                    {osintData.companyProfile.employeeCount}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ACTIVITY_LOG.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        entry.status === "success"
                          ? "bg-green-500"
                          : entry.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-foreground/80">{entry.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.target}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// OSINT Engine Tab Component
function OSINTEngineTab({ osintData }: { osintData: OSINTData }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500/20 text-red-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-wide text-foreground flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          OSINT Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Intelligence gathered on{" "}
          <span className="text-primary">{osintData.companyProfile.name}</span>
        </p>
      </div>

      {/* Company Profile */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Company Name
              </p>
              <p className="text-sm text-foreground">
                {osintData.companyProfile.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Domain
              </p>
              <p className="text-sm text-primary">
                {osintData.companyProfile.domain}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Industry
              </p>
              <p className="text-sm text-foreground">
                {osintData.companyProfile.industry}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Founded
              </p>
              <p className="text-sm text-foreground">
                {osintData.companyProfile.founded}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Headquarters
              </p>
              <p className="text-sm text-foreground">
                {osintData.companyProfile.headquarters}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Employees
              </p>
              <p className="text-sm text-foreground">
                {osintData.companyProfile.employeeCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Revenue
              </p>
              <p className="text-sm text-foreground">
                {osintData.companyProfile.revenue}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Description
              </p>
              <p className="text-sm text-foreground/80">
                {osintData.companyProfile.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack & Social Media */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tech Stack */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {osintData.techStack.map((stack) => (
              <div key={stack.category}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  {stack.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {stack.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-secondary/50 text-foreground/80 border-0"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Social Media Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {osintData.socialMedia.map((social) => (
                <div
                  key={social.platform}
                  className="flex items-center justify-between p-3 rounded-md bg-secondary/30"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {social.platform}
                    </p>
                    <p className="text-xs text-primary">{social.handle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{social.followers}</p>
                    <p className="text-xs text-muted-foreground">
                      {social.lastActive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Personnel */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Key Personnel
          </CardTitle>
          <CardDescription>
            High-value targets identified within the organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {osintData.keyPersonnel.map((person) => (
              <div
                key={person.email}
                className="p-4 rounded-md bg-secondary/30 border border-border/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {person.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{person.role}</p>
                  </div>
                  <Badge className={`text-xs ${getRiskColor(person.riskLevel)}`}>
                    {person.riskLevel}
                  </Badge>
                </div>
                <Separator className="my-3 bg-border/30" />
                <div className="space-y-1">
                  <p className="text-xs text-primary truncate">{person.email}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    linkedin.com{person.linkedin}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vulnerabilities */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Discovered Vulnerabilities
          </CardTitle>
          <CardDescription>
            Security weaknesses identified during reconnaissance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {osintData.vulnerabilities.map((vuln) => (
              <div
                key={vuln.id}
                className="p-4 rounded-md bg-secondary/30 border border-border/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`text-xs uppercase ${getSeverityColor(
                        vuln.severity
                      )}`}
                    >
                      {vuln.severity}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {vuln.type}
                      </p>
                      <p className="text-xs text-muted-foreground">{vuln.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Exploitability
                    </p>
                    <p className="text-sm text-primary">{vuln.exploitability}%</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/70 mt-2">
                  {vuln.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attack Vectors */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Identified Attack Vectors
          </CardTitle>
          <CardDescription>
            Potential attack channels based on gathered intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {osintData.attackVectors.map((vector) => (
              <div
                key={vector.id}
                className="p-4 rounded-md bg-secondary/30 border border-border/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {vector.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 text-xs border-primary/30 text-primary"
                    >
                      {vector.channel}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-lg font-light text-primary">
                      {vector.successRate}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground/70">{vector.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Execute Attack Tab Component
function ExecuteAttackTab({
  targetName,
  isEnabled,
}: {
  targetName: string;
  isEnabled: boolean;
}) {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteAttack = () => {
    if (!isEnabled) return;
    setIsExecuting(true);
    console.log(`[REVEL8] Executing multi-channel attack on target: ${targetName}`);
    // Simulate attack execution
    setTimeout(() => {
      setIsExecuting(false);
    }, 3000);
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
            disabled={!isEnabled || isExecuting}
            size="lg"
            className={`w-full h-14 text-sm tracking-widest uppercase font-medium transition-all duration-300 ${
              isEnabled
                ? "bg-primary/90 hover:bg-primary hover:glow-purple-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isExecuting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                Executing...
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
    </div>
  );
}
