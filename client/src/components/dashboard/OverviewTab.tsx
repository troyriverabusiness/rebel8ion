import {
  Building2,
  Users,
  AlertTriangle,
  Target,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { type OSINTData } from "@/types/osint";

interface OverviewTabProps {
  targetName: string;
  osintData: OSINTData | null;
  isLoading?: boolean;
}

export default function OverviewTab({ targetName, osintData, isLoading = false }: OverviewTabProps) {
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
            {isLoading ? (
              <>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="mt-2 h-1 w-full" />
              </>
            ) : (
              <>
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
              </>
            )}
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
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-light">
                  {osintData?.vulnerabilities.length || 0}
                </span>
              )}
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
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-light">
                  {osintData?.attackVectors.length || 0}
                </span>
              )}
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
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-light">
                  {osintData?.keyPersonnel.length || 0}
                </span>
              )}
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
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
                <Skeleton className="h-4 w-9/12" />
                <Skeleton className="h-4 w-8/12" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No activity yet. Waiting for webhook events.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
