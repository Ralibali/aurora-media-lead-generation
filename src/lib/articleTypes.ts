export interface ArticleTable {
  headers: string[];
  rows: string[][];
}

export interface ArticleSection {
  heading: string;
  content: string;
  code?: string;
  table?: ArticleTable;
}

export interface ArticleFAQ {
  q: string;
  a: string;
}

export interface Article {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  category: string;
  publishedDate: string;
  updatedDate: string;
  readMinutes: number;
  keyword: string;
  intro: string;
  sections: ArticleSection[];
  faq: ArticleFAQ[];
  relatedSlugs: string[];
}
