export interface PortfolioData {
  name: string;
  title: string;
  summary: string;
  about: string;
  skills: string[];
  projects: PortfolioProject[];
  experience: PortfolioExperience[];
  certifications?: PortfolioCertification[];
  contact: {
    email: string;
    linkedin: string;
    github: string;
    portfolio?: string;
  };
}

export interface PortfolioCertification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link?: string;
  source?: 'from_resume' | 'manual';
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  source?: 'from_resume' | 'derived_from_experience' | 'ai_generated' | 'manual';
  link?: string;
}

export interface PortfolioExperience {
  id: string;
  company: string;
  role: string;
  date: string;
  description: string[];
  source?: 'from_resume' | 'manual';
}

export const defaultPortfolioData: PortfolioData = {
  name: "John Doe",
  title: "Backend Engineer",
  summary: "Experienced backend engineer passionate about scalable systems and clean architecture.",
  about: "I build robust, high-performance backend systems that power seamless user experiences. With deep expertise in distributed architectures, API design, and cloud infrastructure, I enjoy solving complex engineering challenges at scale. When I'm not coding, I'm exploring new technologies and contributing to open-source projects.",
  skills: ["Node.js", "Python", "Docker", "PostgreSQL", "AWS", "Redis", "GraphQL", "Kubernetes"],
  certifications: [
    {
      id: "c1",
      title: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      source: "manual"
    }
  ],
  projects: [
    {
      id: "1",
      title: "Microservices Payment Gateway",
      description: "Designed a high-throughput payment processor handling 500+ TPS with automatic failover and retry mechanisms, built using event-driven architecture.",
      tech: ["Node.js", "Redis", "Docker", "RabbitMQ"],
      source: "ai_generated",
    },
    {
      id: "2",
      title: "Real-time Analytics Pipeline",
      description: "Built a streaming data pipeline processing 10M+ events/day for real-time dashboards and alerting, using Kafka and ClickHouse.",
      tech: ["Python", "Kafka", "ClickHouse", "Docker"],
      source: "ai_generated",
    }
  ],
  experience: [
    {
      id: "e1",
      company: "Tech Corp",
      role: "Senior Backend Developer",
      date: "2021 — Present",
      description: [
        "Led the migration from monolith to microservices architecture serving 2M+ daily users.",
        "Designed and built event-driven systems using Kafka for real-time data processing.",
        "Mentored a team of 5 junior engineers and established code review standards.",
        "Reduced API latency by 40% through query optimization and caching strategies."
      ]
    },
    {
      id: "e2",
      company: "StartupXYZ",
      role: "Backend Developer",
      date: "2019 — 2021",
      description: [
        "Built REST APIs powering mobile and web applications used by 50K+ users.",
        "Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes.",
        "Designed database schemas and optimized PostgreSQL queries for complex reporting."
      ]
    }
  ],
  contact: {
    email: "john@example.com",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
  }
};
