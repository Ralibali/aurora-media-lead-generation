import { Link } from "react-router-dom";

interface RelatedLink {
  to: string;
  title: string;
  caption?: string;
}

interface RelatedLinksProps {
  heading?: string;
  links: RelatedLink[];
  columns?: 2 | 3;
}

const RelatedLinks = ({ heading = "Läs vidare", links, columns = 2 }: RelatedLinksProps) => {
  if (!links.length) return null;
  const grid = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <section className="mt-16">
      <h2 className="font-serif text-3xl mb-6">{heading}</h2>
      <div className={`grid grid-cols-1 ${grid} gap-4`}>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-lg border border-border bg-card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            {l.caption && <p className="label-caps !text-[10px] mb-2">{l.caption}</p>}
            <p className="font-serif text-lg leading-snug">{l.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedLinks;
