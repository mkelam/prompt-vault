"use client";

import React, { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { Prompt, PromptCategory } from "@/lib/types";
import { GlassInput } from "@/app/components/ui/GlassInput"; // We need to create this or use raw input
import { GlassButton } from "@/app/components/ui/GlassButton";
import { GlassCard } from "@/app/components/ui/GlassCard";

interface PromptSearchProps {
  prompts: Prompt[];
  onFilter: (filtered: Prompt[]) => void;
}

export function PromptSearch({ prompts, onFilter }: PromptSearchProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PromptCategory | "all">("all");

  useEffect(() => {
    let result = prompts;

    // 1. Filter by Category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // 2. Filter by Search Query
    if (query.trim()) {
      const fuse = new Fuse(result, {
        keys: [
          { name: "title", weight: 2 },
          { name: "description", weight: 1 },
          { name: "tags", weight: 0.5 },
        ],
        threshold: 0.3,
      });
      result = fuse.search(query).map((res) => res.item);
    }

    onFilter(result);
  }, [query, activeCategory, prompts, onFilter]);

  const categories: (PromptCategory | "all")[] = [
    "all",
    "strategy",
    "project-management",
    "operations",
    "business-analysis",
    "financial",
    "hr-talent",
  ];

  return (
    <div className="space-y-6" role="search" aria-label="Search prompts">
      <div className="relative">
        <label htmlFor="prompt-search" className="sr-only">
          Search for prompts
        </label>
        <input
          id="prompt-search"
          type="search"
          placeholder="Search for a prompt (e.g. 'McKinsey', 'Project Charter')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass-input w-full text-lg py-4 pl-12 focus:ring-2 focus:ring-blue-400/50"
          aria-describedby="search-hint"
        />
        <span id="search-hint" className="sr-only">
          Type to search through all prompts by title, description, or tags
        </span>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by category"
      >
        {categories.map((cat) => (
          <GlassButton
            key={cat}
            size="sm"
            variant={activeCategory === cat ? "primary" : "secondary"}
            onClick={() => setActiveCategory(cat)}
            className="capitalize"
            aria-pressed={activeCategory === cat}
            aria-label={`Filter by ${cat === "all" ? "all categories" : cat.replace("-", " ")}`}
          >
            {cat.replace("-", " ")}
          </GlassButton>
        ))}
      </div>
    </div>
  );
}
