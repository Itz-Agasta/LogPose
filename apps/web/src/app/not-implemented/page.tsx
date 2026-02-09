"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotImplementedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <Zap className="h-16 w-16 text-primary opacity-60" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Coming Soon!</h1>
          <p className="text-lg text-muted-foreground">
            This feature isn't quite ready yet, but we're working hard to bring it to you.
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-3">
            In the meantime, why not explore our AI Chat feature?
          </p>
          <p className="text-sm text-foreground font-medium">
            Chat with our intelligent agents to analyze your data with natural language!
          </p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row justify-center">
          <Button asChild>
            <Link href="/chat" className="flex items-center gap-2">
              <span>Try AI Chat</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/home">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
