import {
  Search,
  Building2,
  Users,
  Shield,
  Globe,
  Code,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OSINTEngineTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-wide text-foreground flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          OSINT Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gathering intelligence...
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
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
            <div className="md:col-span-2">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24 mb-2" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-6 w-20" />
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
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-md bg-secondary/30"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
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
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-md bg-secondary/30 border border-border/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
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
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-md bg-secondary/30 border border-border/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-16" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-md bg-secondary/30 border border-border/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
