import type { Article } from "./articleTypes";
import { articles1to6 } from "./articlesData1";
import { articles7to12 } from "./articlesData2";
import { articles13to18 } from "./articlesData3";
import { articles19to24 } from "./articlesData4";

export type { Article } from "./articleTypes";

export const articles: Article[] = [...articles19to24, ...articles13to18, ...articles1to6, ...articles7to12];

export const getArticle = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const getRelatedArticles = (slugs: string[]): Article[] =>
  slugs.map((s) => articles.find((a) => a.slug === s)).filter((a): a is Article => Boolean(a));

export const articleCategories = Array.from(new Set(articles.map((a) => a.category)));
