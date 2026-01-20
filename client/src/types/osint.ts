// ABOUTME: TypeScript types for OSINT webhook payloads.
// ABOUTME: Used by the UI + SSE handler to validate incoming data.

export type RiskLevel = "high" | "medium" | "low" | (string & {});
export type Severity = "critical" | "high" | "medium" | "low" | (string & {});

export interface CompanyProfile {
  name: string;
  domain: string;
  industry: string;
  founded: string;
  headquarters: string;
  employeeCount: string;
  revenue: string;
  description: string;
}

export interface TechStackCategory {
  category: string;
  technologies: string[];
}

export interface SocialMediaProfile {
  platform: string;
  handle: string;
  followers: string;
  lastActive: string;
}

export interface KeyPerson {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  riskLevel: RiskLevel;
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: Severity;
  description: string;
  exploitability: number;
}

export interface AttackVector {
  id: string;
  name: string;
  channel: string;
  successRate: number;
  description: string;
}

export interface OSINTData {
  osintCompletionPercentage: number;
  companyProfile: CompanyProfile;
  techStack: TechStackCategory[];
  socialMedia: SocialMediaProfile[];
  keyPersonnel: KeyPerson[];
  vulnerabilities: Vulnerability[];
  attackVectors: AttackVector[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasString(obj: Record<string, unknown>, key: string): boolean {
  return isString(obj[key]);
}

/**
 * Runtime type guard for OSINT webhook/SSE payloads.
 * Intentionally checks only the minimum fields the UI relies on.
 */
export function isOSINTPayload(data: unknown): data is OSINTData {
  if (!isRecord(data)) return false;

  const companyProfile = data.companyProfile;
  if (!isRecord(companyProfile)) return false;

  if (!hasString(companyProfile, "name")) return false;

  // Optional-but-used fields: if present, ensure correct types; otherwise allow.
  if (
    "osintCompletionPercentage" in data &&
    data.osintCompletionPercentage !== undefined &&
    !isNumber(data.osintCompletionPercentage)
  ) {
    return false;
  }

  if ("techStack" in data && data.techStack !== undefined && !Array.isArray(data.techStack)) {
    return false;
  }
  if (
    "socialMedia" in data &&
    data.socialMedia !== undefined &&
    !Array.isArray(data.socialMedia)
  ) {
    return false;
  }
  if (
    "keyPersonnel" in data &&
    data.keyPersonnel !== undefined &&
    !Array.isArray(data.keyPersonnel)
  ) {
    return false;
  }
  if (
    "vulnerabilities" in data &&
    data.vulnerabilities !== undefined &&
    !Array.isArray(data.vulnerabilities)
  ) {
    return false;
  }
  if (
    "attackVectors" in data &&
    data.attackVectors !== undefined &&
    !Array.isArray(data.attackVectors)
  ) {
    return false;
  }

  // At this point we consider it OSINT-shaped enough for the UI to render.
  return true;
}

function asString(value: unknown, fallback = ""): string {
  return isString(value) ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return isNumber(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isString) : [];
}

/**
 * Coerce a (possibly partial) OSINT payload into a safe, renderable OSINTData object.
 * Use this when accepting untrusted webhook/SSE data.
 */
export function coerceOSINTData(data: unknown): OSINTData {
  const obj = isRecord(data) ? data : {};
  const cpRaw = isRecord(obj.companyProfile) ? obj.companyProfile : {};

  const companyProfile: CompanyProfile = {
    name: asString(cpRaw.name, "Unknown"),
    domain: asString(cpRaw.domain),
    industry: asString(cpRaw.industry),
    founded: asString(cpRaw.founded),
    headquarters: asString(cpRaw.headquarters),
    employeeCount: asString(cpRaw.employeeCount),
    revenue: asString(cpRaw.revenue),
    description: asString(cpRaw.description),
  };

  const techStack: TechStackCategory[] = Array.isArray(obj.techStack)
    ? obj.techStack
        .filter(isRecord)
        .map((stack) => ({
          category: asString(stack.category),
          technologies: asStringArray(stack.technologies),
        }))
        .filter((s) => s.category.length > 0 || s.technologies.length > 0)
    : [];

  const socialMedia: SocialMediaProfile[] = Array.isArray(obj.socialMedia)
    ? obj.socialMedia
        .filter(isRecord)
        .map((s) => ({
          platform: asString(s.platform),
          handle: asString(s.handle),
          followers: asString(s.followers),
          lastActive: asString(s.lastActive),
        }))
        .filter((s) => s.platform.length > 0 || s.handle.length > 0)
    : [];

  const keyPersonnel: KeyPerson[] = Array.isArray(obj.keyPersonnel)
    ? obj.keyPersonnel
        .filter(isRecord)
        .map((p) => ({
          name: asString(p.name),
          role: asString(p.role),
          email: asString(p.email),
          linkedin: asString(p.linkedin),
          riskLevel: asString(p.riskLevel) as RiskLevel,
        }))
        .filter((p) => p.email.length > 0 || p.name.length > 0)
    : [];

  const vulnerabilities: Vulnerability[] = Array.isArray(obj.vulnerabilities)
    ? obj.vulnerabilities
        .filter(isRecord)
        .map((v) => ({
          id: asString(v.id),
          type: asString(v.type),
          severity: asString(v.severity) as Severity,
          description: asString(v.description),
          exploitability: asNumber(v.exploitability),
        }))
        .filter((v) => v.id.length > 0 || v.type.length > 0)
    : [];

  const attackVectors: AttackVector[] = Array.isArray(obj.attackVectors)
    ? obj.attackVectors
        .filter(isRecord)
        .map((v) => ({
          id: asString(v.id),
          name: asString(v.name),
          channel: asString(v.channel),
          successRate: asNumber(v.successRate),
          description: asString(v.description),
        }))
        .filter((v) => v.id.length > 0 || v.name.length > 0)
    : [];

  return {
    osintCompletionPercentage: asNumber(obj.osintCompletionPercentage),
    companyProfile,
    techStack,
    socialMedia,
    keyPersonnel,
    vulnerabilities,
    attackVectors,
  };
}
