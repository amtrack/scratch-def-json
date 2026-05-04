#!/usr/bin/env bun
export {};

import { $ } from "bun";
import { mkdirSync } from "node:fs";

const outDir = ".local/research";
mkdirSync(outDir, { recursive: true });

interface SearchItem {
  name: string;
  path: string;
  repository: { full_name: string };
}

interface SearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: SearchItem[];
}

async function searchPage(page: number): Promise<SearchResult> {
  const result =
    await $`gh api search/code --method GET -f q=filename:project-scratch-def.json -f per_page=100 -f page=${page}`.json();
  return result as SearchResult;
}

async function downloadContent(owner: string, repo: string, path: string): Promise<string> {
  const result = await $`gh api repos/${owner}/${repo}/contents/${path} --jq .content`.text();
  return atob(result.trim());
}

const maxItems = 300;
let page = 1;
let totalDownloaded = 0;
let totalCount = 0;
let totalProcessed = 0;

do {
  console.log(`Fetching search results page ${page}...`);
  const result = await searchPage(page);
  totalCount = result.total_count;
  console.log(`Total results: ${totalCount}, got ${result.items.length} items`);

  for (const item of result.items) {
    if (totalProcessed >= maxItems) break;
    totalProcessed++;

    const safeName = item.repository.full_name.replace(/\//g, "--");
    const safePath = item.path.replace(/\//g, "--");
    const filename = `${safeName}--${safePath}`;
    const filePath = `${outDir}/${filename}`;

    if (await Bun.file(filePath).exists()) {
      console.log(`  skip (exists): ${filename}`);
      continue;
    }

    try {
      const [owner, repo] = item.repository.full_name.split("/");
      const content = await downloadContent(owner, repo, item.path);
      await Bun.file(filePath).write(content);
      console.log(`  saved: ${filename}`);
      totalDownloaded++;
    } catch (err) {
      console.error(`  error: ${filename}: ${err}`);
    }
  }

  if (totalProcessed >= maxItems) break;
  if (result.items.length < 100) break;
  page++;
  // Respect rate limits
  await Bun.sleep(2000);
} while (true);

console.log(`Done. Downloaded ${totalDownloaded} new files (${totalCount} total results).`);
