"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, BookOpen, Bot, Brain, Database, FileText, Github, Globe, Layers, Layout, Network, Shield, Zap } from "lucide-react";
import Particles from "../components/ui/particles";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

export default function LandingPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-primary/20">

      {/* Background Particles - Full Screen */}
      <div className="fixed inset-0 z-0 bg-black">
        <Particles
          particleColors={["#ffffff", "#888888"]}
          particleCount={300}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
          particleHoverFactor={1}
          className="h-full w-full"
        />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* Header */}
        <header className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">LogPose</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#agents" className="text-muted-foreground hover:text-foreground transition-colors">
              Agents
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2" asChild>
              <Link href="https://github.com/Itz-Agasta/LogPose" target="_blank" rel="noopener noreferrer">
                <span>Star Repo</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/chat">Get Started</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32 lg:px-8">
            <Badge variant="outline" className="mb-6 rounded-full border-primary/50 bg-primary/10 px-4 py-1.5 text-primary backdrop-blur-sm">
              <span className="animate-pulse mr-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
              v1.0 Public Beta is Live
            </Badge>

            <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Navigate your Data Ocean with <span className="text-primary">Intelligent Agents</span>
            </h1>

            <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              LogPose orchestrates specialized AI agents to analyze, visualize, and interpret your maritime and logistics data. Powered by DuckDB for lightning-fast analytics.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8 text-base shadow-[0_0_20px_-5px_var(--color-primary)] hover:shadow-[0_0_30px_-5px_var(--color-primary)] transition-shadow" asChild>
                <Link href="/chat" className="flex items-center gap-2">
                  <span>Start Exploring</span> <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base backdrop-blur-sm bg-background/10 hover:bg-background/20" asChild>
                <Link href="https://github.com/Itz-Agasta/LogPose">
                  View Source
                </Link>
              </Button>
            </div>
          </section>

          <Separator className="opacity-20" />

          {/* Features Grid */}
          <section id="features" className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Engineered for Scale</h2>
              <p className="mt-4 text-muted-foreground">Built with a modern stack designed for performance and reliability.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Database className="h-10 w-10 text-primary" />}
                title="DuckDB Powered"
                description="In-process SQL OLAP database management system for lightning-fast analytical queries on your data."
              />
              <FeatureCard
                icon={<BarChart2 className="h-10 w-10 text-primary" />}
                title="Interactive Visualizations"
                description="Create dynamic charts, maps, and dashboards directly from your data queries instantly."
              />
              <FeatureCard
                icon={<Layers className="h-10 w-10 text-primary" />}
                title="Multi-Agent System"
                description="Orchestrator, SQL, and RAG agents work together to break down complex queries."
              />
              <FeatureCard
                icon={<Globe className="h-10 w-10 text-primary" />}
                title="Geospatial Analysis"
                description="Native support for geospatial data processing and visualization on interactive maps."
              />
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Real-time Processing"
                description="Stream processing capabilities to handle data as it arrives."
              />
              <FeatureCard
                icon={<Shield className="h-10 w-10 text-primary" />}
                title="Secure by Design"
                description="Enterprise-grade security adhering to best practices for data protection."
              />
            </div>
          </section>

          <Separator className="opacity-20" />

          {/* Agents Section */}
          <section id="agents" className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Meet the Agents</h2>
              <p className="mt-4 text-muted-foreground">Specialized AI workers aimed at specific tasks to deliver comprehensive insights.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <AgentCard
                icon={<Brain className="h-8 w-8" />}
                title="Orchestrator"
                description="The master planner that breaks down complex user queries and delegates tasks to specialized agents."
              />
              <AgentCard
                icon={<Database className="h-8 w-8" />}
                title="SQL Agent"
                description="Expert in translating natural language into optimized SQL queries for DuckDB analysis."
              />
              <AgentCard
                icon={<FileText className="h-8 w-8" />}
                title="RAG Agent"
                description="Retrieves relevant context and documentation to augment answers with semantic knowledge."
              />
              <AgentCard
                icon={<Network className="h-8 w-8" />}
                title="Router Agent"
                description="Intelligently directs queries to the most appropriate processing pipeline or sub-agent."
              />
            </div>
          </section>

          <Separator className="opacity-20" />

          {/* About Section */}
          <section id="about" className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border/50 bg-background/30 p-8 md:p-12 backdrop-blur-md">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">About LogPose</h2>
                <div className="space-y-4 text-lg text-muted-foreground text-left mx-auto max-w-2xl">
                  <p>
                    LogPose was born from the need to simplify complex data interactions in the maritime and logistics sector.
                    Navigating through terabytes of data shouldn't require deep technical expertise in SQL or programming.
                  </p>
                  <p>
                    Our mission is to empower decision-makers with a natural language interface that puts the power of
                    advanced analytics at their fingertips. By combining state-of-the-art LLMs with high-performance
                    DuckDB analytics, we're redefining how data is explored.
                  </p>
                </div>
                <div className="mt-10 flex justify-center gap-12">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-foreground">100%</span>
                    <span className="text-sm text-muted-foreground mt-1">Open Source</span>
                  </div>
                  <div className="h-16 w-px bg-border/50"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold text-foreground">Local</span>
                    <span className="text-sm text-muted-foreground mt-1">First Architecture</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div className="fixed bottom-6 right-6 z-50">
          <Link href="https://tambo.co/" target="_blank" rel="noopener noreferrer">
            <div className="relative group cursor-pointer overflow-hidden rounded-full border border-white/10 bg-white/5 p-[1px] shadow-2xl backdrop-blur-xl transition-all hover:bg-white/10">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#dcfce7_0%,#16a34a_50%,#dcfce7_100%)]" />
              <div className="relative flex h-full items-center justify-center rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-3xl">
                <span>Made with Tambo AI</span>
              </div>
            </div>
          </Link>
        </div>

        <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by the LogPose team. The source code is available on <a href="#" className="font-medium underline underline-offset-4">GitHub</a>.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">Terms</Link>
              <Link href="#" className="hover:text-foreground">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-background/40 backdrop-blur-md border-border/50 transition-all hover:bg-background/60 hover:border-primary/50">
      <CardHeader>
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

function AgentCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-background/20 p-6 transition-all hover:bg-background/40 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

