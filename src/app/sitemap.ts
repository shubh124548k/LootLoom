import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lootloom.netlify.app";

const ROUTES = [
  { path: "", priority: 1.0 },
  { path: "/#home", priority: 0.9 },
  { path: "/#features-overview", priority: 0.8 },
  { path: "/#how-it-works", priority: 0.8 },
  { path: "/#privacy", priority: 0.6 },
  { path: "/#terms", priority: 0.6 },
  { path: "/#cookies", priority: 0.6 },
  { path: "/#contact", priority: 0.6 },
  { path: "/#about", priority: 0.7 },
  { path: "/#faq-public", priority: 0.7 },
  { path: "/#help-center", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route.priority,
  }));
}
