// Mock OSINT data for demonstration purposes
// This file contains hardcoded data for all dashboard tabs

export interface CompanyProfile {
  name: string;
  domain: string;
  industry: string;
  founded: number;
  headquarters: string;
  employeeCount: string;
  revenue: string;
  description: string;
}

export interface TechStack {
  category: string;
  technologies: string[];
}

export interface SocialMedia {
  platform: string;
  handle: string;
  followers: string;
  lastActive: string;
}

export interface KeyPersonnel {
  name: string;
  role: string;
  email: string;
  linkedin: string;
  riskLevel: "low" | "medium" | "high";
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
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
  companyProfile: CompanyProfile;
  techStack: TechStack[];
  socialMedia: SocialMedia[];
  keyPersonnel: KeyPersonnel[];
  vulnerabilities: Vulnerability[];
  attackVectors: AttackVector[];
  osintCompletionPercentage: number;
}

// Mock data for each target company
export const MOCK_OSINT_DATA: Record<string, OSINTData> = {
  Cipher: {
    companyProfile: {
      name: "Cipher Technologies",
      domain: "cipher-tech.io",
      industry: "Cybersecurity",
      founded: 2018,
      headquarters: "San Francisco, CA",
      employeeCount: "150-200",
      revenue: "$25M - $50M",
      description: "Enterprise security solutions provider specializing in zero-trust architecture and threat detection systems.",
    },
    techStack: [
      { category: "Frontend", technologies: ["React", "TypeScript", "Tailwind CSS"] },
      { category: "Backend", technologies: ["Node.js", "Python", "Go"] },
      { category: "Infrastructure", technologies: ["AWS", "Kubernetes", "Terraform"] },
      { category: "Security", technologies: ["Vault", "Okta", "Cloudflare"] },
    ],
    socialMedia: [
      { platform: "LinkedIn", handle: "@cipher-technologies", followers: "12.5K", lastActive: "2 hours ago" },
      { platform: "Twitter/X", handle: "@CipherTechIO", followers: "8.2K", lastActive: "4 hours ago" },
      { platform: "GitHub", handle: "cipher-tech", followers: "2.1K", lastActive: "1 day ago" },
    ],
    keyPersonnel: [
      { name: "Marcus Chen", role: "CEO & Co-Founder", email: "m.chen@cipher-tech.io", linkedin: "/in/marcus-chen", riskLevel: "high" },
      { name: "Sarah Williams", role: "CTO", email: "s.williams@cipher-tech.io", linkedin: "/in/sarah-williams-cto", riskLevel: "high" },
      { name: "David Park", role: "VP of Engineering", email: "d.park@cipher-tech.io", linkedin: "/in/david-park-eng", riskLevel: "medium" },
      { name: "Elena Rodriguez", role: "Head of Sales", email: "e.rodriguez@cipher-tech.io", linkedin: "/in/elena-rodriguez", riskLevel: "medium" },
      { name: "James Morrison", role: "Security Analyst", email: "j.morrison@cipher-tech.io", linkedin: "/in/james-morrison-sec", riskLevel: "low" },
    ],
    vulnerabilities: [
      { id: "VULN-001", type: "Email Security", severity: "high", description: "No DMARC policy configured for primary domain", exploitability: 85 },
      { id: "VULN-002", type: "Social Engineering", severity: "medium", description: "Employee information exposed on LinkedIn", exploitability: 70 },
      { id: "VULN-003", type: "Infrastructure", severity: "low", description: "Outdated SSL certificate on staging subdomain", exploitability: 40 },
    ],
    attackVectors: [
      { id: "AV-001", name: "Spear Phishing", channel: "Email", successRate: 75, description: "Targeted email campaign impersonating vendor" },
      { id: "AV-002", name: "LinkedIn Social Engineering", channel: "Social Media", successRate: 60, description: "Connection request with malicious payload" },
      { id: "AV-003", name: "Vishing", channel: "Phone", successRate: 45, description: "IT support impersonation call" },
    ],
    osintCompletionPercentage: 100,
  },
  Phantom: {
    companyProfile: {
      name: "Phantom Industries",
      domain: "phantom-ind.com",
      industry: "Defense & Aerospace",
      founded: 2005,
      headquarters: "Arlington, VA",
      employeeCount: "500-750",
      revenue: "$100M - $250M",
      description: "Advanced defense systems and aerospace technology contractor with government contracts.",
    },
    techStack: [
      { category: "Frontend", technologies: ["Angular", "TypeScript"] },
      { category: "Backend", technologies: ["Java", "C++", ".NET"] },
      { category: "Infrastructure", technologies: ["Azure Gov", "VMware"] },
      { category: "Security", technologies: ["CrowdStrike", "Palo Alto", "SentinelOne"] },
    ],
    socialMedia: [
      { platform: "LinkedIn", handle: "@phantom-industries", followers: "45.2K", lastActive: "1 hour ago" },
      { platform: "Twitter/X", handle: "@PhantomInd", followers: "15.8K", lastActive: "6 hours ago" },
    ],
    keyPersonnel: [
      { name: "Gen. Robert Hayes (Ret.)", role: "CEO", email: "r.hayes@phantom-ind.com", linkedin: "/in/robert-hayes-defense", riskLevel: "high" },
      { name: "Dr. Lisa Chang", role: "Chief Scientist", email: "l.chang@phantom-ind.com", linkedin: "/in/lisa-chang-phd", riskLevel: "high" },
      { name: "Michael Torres", role: "CFO", email: "m.torres@phantom-ind.com", linkedin: "/in/michael-torres-cfo", riskLevel: "medium" },
    ],
    vulnerabilities: [
      { id: "VULN-001", type: "Email Security", severity: "medium", description: "SPF record misconfiguration", exploitability: 60 },
      { id: "VULN-002", type: "Physical Security", severity: "low", description: "Badge photos visible in conference photos", exploitability: 30 },
    ],
    attackVectors: [
      { id: "AV-001", name: "Contractor Impersonation", channel: "Email", successRate: 55, description: "Fake vendor communication" },
      { id: "AV-002", name: "Watering Hole", channel: "Web", successRate: 40, description: "Compromise industry forum" },
    ],
    osintCompletionPercentage: 100,
  },
  Vector: {
    companyProfile: {
      name: "Vector Financial",
      domain: "vectorfinancial.com",
      industry: "Financial Services",
      founded: 2012,
      headquarters: "New York, NY",
      employeeCount: "300-400",
      revenue: "$75M - $100M",
      description: "Fintech company providing algorithmic trading platforms and investment management solutions.",
    },
    techStack: [
      { category: "Frontend", technologies: ["Vue.js", "TypeScript", "D3.js"] },
      { category: "Backend", technologies: ["Python", "Rust", "PostgreSQL"] },
      { category: "Infrastructure", technologies: ["GCP", "Docker", "Redis"] },
      { category: "Security", technologies: ["Auth0", "Snyk", "DataDog"] },
    ],
    socialMedia: [
      { platform: "LinkedIn", handle: "@vector-financial", followers: "28.3K", lastActive: "30 min ago" },
      { platform: "Twitter/X", handle: "@VectorFin", followers: "22.1K", lastActive: "2 hours ago" },
      { platform: "Bloomberg", handle: "VCTR", followers: "N/A", lastActive: "Real-time" },
    ],
    keyPersonnel: [
      { name: "Alexandra Petrov", role: "CEO", email: "a.petrov@vectorfinancial.com", linkedin: "/in/alexandra-petrov", riskLevel: "high" },
      { name: "Jonathan Webb", role: "CTO", email: "j.webb@vectorfinancial.com", linkedin: "/in/jonathan-webb-fintech", riskLevel: "high" },
      { name: "Rachel Kim", role: "Head of Compliance", email: "r.kim@vectorfinancial.com", linkedin: "/in/rachel-kim-compliance", riskLevel: "medium" },
      { name: "Thomas Grant", role: "Lead Quant Developer", email: "t.grant@vectorfinancial.com", linkedin: "/in/thomas-grant-quant", riskLevel: "medium" },
    ],
    vulnerabilities: [
      { id: "VULN-001", type: "API Security", severity: "critical", description: "Public API documentation exposes internal endpoints", exploitability: 90 },
      { id: "VULN-002", type: "Social Engineering", severity: "high", description: "Detailed org chart available on company website", exploitability: 75 },
      { id: "VULN-003", type: "Third Party", severity: "medium", description: "Vulnerable version of logging library in use", exploitability: 55 },
    ],
    attackVectors: [
      { id: "AV-001", name: "Business Email Compromise", channel: "Email", successRate: 70, description: "Wire transfer fraud via CFO impersonation" },
      { id: "AV-002", name: "Supply Chain Attack", channel: "Software", successRate: 50, description: "Compromise third-party trading library" },
      { id: "AV-003", name: "SMS Phishing", channel: "Mobile", successRate: 45, description: "MFA bypass via SIM swap" },
    ],
    osintCompletionPercentage: 100,
  },
  Specter: {
    companyProfile: {
      name: "Specter Biotech",
      domain: "specterbio.com",
      industry: "Biotechnology",
      founded: 2015,
      headquarters: "Boston, MA",
      employeeCount: "200-300",
      revenue: "$50M - $75M",
      description: "Cutting-edge biotech firm focused on CRISPR gene editing and personalized medicine solutions.",
    },
    techStack: [
      { category: "Frontend", technologies: ["React", "Next.js"] },
      { category: "Backend", technologies: ["Python", "R", "FastAPI"] },
      { category: "Infrastructure", technologies: ["AWS", "Databricks"] },
      { category: "Security", technologies: ["Duo", "CyberArk", "Varonis"] },
    ],
    socialMedia: [
      { platform: "LinkedIn", handle: "@specter-biotech", followers: "18.7K", lastActive: "3 hours ago" },
      { platform: "Twitter/X", handle: "@SpecterBio", followers: "9.4K", lastActive: "1 day ago" },
      { platform: "ResearchGate", handle: "Specter-Biotech", followers: "5.2K", lastActive: "1 week ago" },
    ],
    keyPersonnel: [
      { name: "Dr. Emily Watson", role: "CEO & Founder", email: "e.watson@specterbio.com", linkedin: "/in/emily-watson-phd", riskLevel: "high" },
      { name: "Dr. Raj Patel", role: "Chief Science Officer", email: "r.patel@specterbio.com", linkedin: "/in/raj-patel-cso", riskLevel: "high" },
      { name: "Nicole Foster", role: "VP of Operations", email: "n.foster@specterbio.com", linkedin: "/in/nicole-foster-ops", riskLevel: "medium" },
    ],
    vulnerabilities: [
      { id: "VULN-001", type: "Data Protection", severity: "critical", description: "Research data shared via unsecured cloud storage", exploitability: 85 },
      { id: "VULN-002", type: "Email Security", severity: "high", description: "No email authentication protocols", exploitability: 80 },
    ],
    attackVectors: [
      { id: "AV-001", name: "Research Collaboration Phishing", channel: "Email", successRate: 80, description: "Fake research collaboration request" },
      { id: "AV-002", name: "Conference Networking", channel: "In-Person", successRate: 65, description: "Impersonation at industry conference" },
    ],
    osintCompletionPercentage: 100,
  },
  Nexus: {
    companyProfile: {
      name: "Nexus Cloud Systems",
      domain: "nexuscloud.io",
      industry: "Cloud Computing",
      founded: 2016,
      headquarters: "Seattle, WA",
      employeeCount: "400-500",
      revenue: "$80M - $120M",
      description: "Enterprise cloud infrastructure and multi-cloud management platform provider.",
    },
    techStack: [
      { category: "Frontend", technologies: ["React", "Svelte", "GraphQL"] },
      { category: "Backend", technologies: ["Go", "Rust", "gRPC"] },
      { category: "Infrastructure", technologies: ["Multi-cloud", "Kubernetes", "Istio"] },
      { category: "Security", technologies: ["HashiCorp Vault", "Teleport", "Falco"] },
    ],
    socialMedia: [
      { platform: "LinkedIn", handle: "@nexus-cloud-systems", followers: "35.6K", lastActive: "1 hour ago" },
      { platform: "Twitter/X", handle: "@NexusCloudIO", followers: "28.9K", lastActive: "30 min ago" },
      { platform: "GitHub", handle: "nexus-cloud", followers: "12.4K", lastActive: "2 hours ago" },
      { platform: "Discord", handle: "NexusCloud", followers: "8.1K", lastActive: "Active now" },
    ],
    keyPersonnel: [
      { name: "Kevin O'Brien", role: "CEO", email: "k.obrien@nexuscloud.io", linkedin: "/in/kevin-obrien-cloud", riskLevel: "high" },
      { name: "Priya Sharma", role: "CTO", email: "p.sharma@nexuscloud.io", linkedin: "/in/priya-sharma-cto", riskLevel: "high" },
      { name: "Chris Anderson", role: "VP of Sales", email: "c.anderson@nexuscloud.io", linkedin: "/in/chris-anderson-sales", riskLevel: "medium" },
      { name: "Maya Johnson", role: "DevRel Lead", email: "m.johnson@nexuscloud.io", linkedin: "/in/maya-johnson-devrel", riskLevel: "low" },
      { name: "Alex Turner", role: "Security Engineer", email: "a.turner@nexuscloud.io", linkedin: "/in/alex-turner-sec", riskLevel: "medium" },
    ],
    vulnerabilities: [
      { id: "VULN-001", type: "Open Source", severity: "high", description: "Internal tools leaked in public GitHub repos", exploitability: 80 },
      { id: "VULN-002", type: "Social Engineering", severity: "medium", description: "Active Discord community with employees", exploitability: 65 },
      { id: "VULN-003", type: "Infrastructure", severity: "medium", description: "Exposed Kubernetes dashboard on dev cluster", exploitability: 60 },
      { id: "VULN-004", type: "Email Security", severity: "low", description: "Weak DMARC policy (p=none)", exploitability: 45 },
    ],
    attackVectors: [
      { id: "AV-001", name: "Open Source Contribution Attack", channel: "GitHub", successRate: 65, description: "Malicious PR to internal tool" },
      { id: "AV-002", name: "Discord Social Engineering", channel: "Social Media", successRate: 55, description: "Trust building in community channels" },
      { id: "AV-003", name: "Recruiter Impersonation", channel: "LinkedIn", successRate: 50, description: "Fake job opportunity with payload" },
      { id: "AV-004", name: "Technical Support Scam", channel: "Email", successRate: 45, description: "Fake security alert from cloud provider" },
    ],
    osintCompletionPercentage: 100,
  },
};

// Get OSINT data for a specific target
export function getOSINTData(targetName: string): OSINTData | null {
  return MOCK_OSINT_DATA[targetName] || null;
}

// Overview statistics
export interface OverviewStats {
  totalTargets: number;
  osintComplete: number;
  attacksExecuted: number;
  successRate: number;
}

export const OVERVIEW_STATS: OverviewStats = {
  totalTargets: 5,
  osintComplete: 5,
  attacksExecuted: 0,
  successRate: 0,
};

// Activity log for overview
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  status: "success" | "pending" | "failed";
}

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  { id: "1", timestamp: "2026-01-16 14:32:15", action: "OSINT Collection Complete", target: "Cipher", status: "success" },
  { id: "2", timestamp: "2026-01-16 14:28:42", action: "Target Profile Generated", target: "Phantom", status: "success" },
  { id: "3", timestamp: "2026-01-16 14:15:03", action: "Social Media Scan", target: "Vector", status: "success" },
  { id: "4", timestamp: "2026-01-16 13:58:21", action: "Vulnerability Assessment", target: "Specter", status: "success" },
  { id: "5", timestamp: "2026-01-16 13:42:08", action: "Personnel Enumeration", target: "Nexus", status: "success" },
];
