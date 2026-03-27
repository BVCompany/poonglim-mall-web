/**
 * Blog Posts Screen
 *
 * This component displays a list of blog posts from MDX files in the docs directory.
 * It uses mdx-bundler to extract frontmatter from MDX files and renders a grid of
 * blog post cards with images, titles, descriptions, and metadata.
 */
import type { Route } from "./+types/posts";

import { bundleMDX } from "mdx-bundler";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { Link } from "react-router";

import { Badge } from "~/core/components/ui/badge";

export const meta: Route.MetaFunction = () => {
  return [
    { title: `Supablog | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: "Follow our development journey!" },
  ];
};

interface Frontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
  author: string;
  slug: string;
}

export async function loader() {
  const docsPath = path.join(process.cwd(), "app", "features", "blog", "docs");
  const files = await readdir(docsPath);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

  const frontmatters = await Promise.all(
    mdxFiles.map(async (file) => {
      const filePath = path.join(docsPath, file);
      const { frontmatter } = await bundleMDX({ file: filePath });
      return frontmatter;
    }),
  );

  frontmatters.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return {
    frontmatters: frontmatters as Frontmatter[],
  };
}

export default function Posts({
  loaderData: { frontmatters },
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col items-center">
        <h1 className="text-center text-3xl font-semibold tracking-tight md:text-5xl">
          Blog
        </h1>
        <p className="text-muted-foreground mt-2 text-center font-medium md:text-lg">
          Follow our development journey!
        </p>
      </header>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
        {frontmatters.map((frontmatter) => (
          <Link
            to={`/blog/${frontmatter.slug}`}
            key={frontmatter.slug}
            className="flex flex-col gap-4"
            viewTransition
          >
            <img
              src={`/blog/${frontmatter.slug}.jpg`}
              alt={frontmatter.title}
              className="aspect-square w-full rounded-xl object-cover object-center"
            />
            <Badge variant="secondary" className="text-sm">
              {frontmatter.category}
            </Badge>
            <div>
              <h2 className="text-lg font-bold md:text-2xl">
                {frontmatter.title}
              </h2>
              <p className="text-muted-foreground text-pretty md:text-lg">
                {frontmatter.description}
              </p>
              <span className="text-muted-foreground mt-2 block text-sm">
                By {frontmatter.author} on{" "}
                {new Date(frontmatter.date).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
