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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type OSINTData } from "@/data/mockData";

interface OSINTEngineTabProps {
  osintData: OSINTData;
}

export default function OSINTEngineTab({ osintData }: OSINTEngineTabProps) {
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
