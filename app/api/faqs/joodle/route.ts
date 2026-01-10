import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

type FaqItem = {
  id: string;
  title: string;
  content: string;
  order: number;
};

type FaqSection = {
  id: string;
  title: string;
  order: number;
  items: FaqItem[];
};

type FaqResponse = {
  sections: FaqSection[];
};

function parseFrontmatter(fileContent: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: fileContent };
  }

  const frontmatterBlock = match.at(1) ?? "";
  const content = match.at(2) ?? "";

  const data: Record<string, unknown> = {};
  const lines = frontmatterBlock.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value: string | number = line.slice(colonIndex + 1).trim();

      // Try to parse as number
      const numValue = Number(value);
      if (!isNaN(numValue) && value !== "") {
        data[key] = numValue;
      } else {
        data[key] = value;
      }
    }
  }

  return { data, content };
}

export async function GET() {
  const faqsDir = path.join(process.cwd(), "content", "apps", "joodle", "faqs");
  const sections: FaqSection[] = [];

  try {
    const sectionDirs = fs
      .readdirSync(faqsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory());

    for (const sectionDir of sectionDirs) {
      const sectionPath = path.join(faqsDir, sectionDir.name);
      const metaPath = path.join(sectionPath, "_meta.json");

      // Read section metadata
      let meta: { id: string; title: string; order: number };
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      } catch {
        // Skip sections without valid metadata
        continue;
      }

      const items: FaqItem[] = [];
      const files = fs
        .readdirSync(sectionPath)
        .filter((f) => f.endsWith(".md"));

      for (const file of files) {
        const filePath = path.join(sectionPath, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = parseFrontmatter(fileContent);

        items.push({
          id: data.id as string,
          title: data.title as string,
          content: content.trim(),
          order: data.order as number,
        });
      }

      sections.push({
        id: meta.id,
        title: meta.title,
        order: meta.order,
        items: items.toSorted((a, b) => a.order - b.order),
      });
    }

    const response: FaqResponse = {
      sections: sections.toSorted((a, b) => a.order - b.order),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}
