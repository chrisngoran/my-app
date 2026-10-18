import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/qr";

/*
 * Search engines may list the shop; staff pages stay out of search results.
 * Crawlers that collect pages to train AI models are turned away. This is a
 * request that reputable crawlers honour, not a lock.
 */
const AI_CRAWLERS = ["GPTBot", "ChatGPT-User", "CCBot", "Google-Extended", "ClaudeBot", "anthropic-ai", "Bytespider", "PerplexityBot", "Applebot-Extended", "meta-externalagent"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/staff", "/account"] },
      { userAgent: AI_CRAWLERS, disallow: "/" },
    ],
    host: siteUrl(),
  };
}
