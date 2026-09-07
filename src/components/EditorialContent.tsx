import { Fragment } from 'react';

function inline(text: string) {
  return text.split(/(\[[^\]]+\]\((?:https?:\/\/|\/(?!\/))[^\s)]+\))/g).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return match ? <a key={index} href={match[2]}>{match[1]}</a> : <Fragment key={index}>{part}</Fragment>;
  });
}

export function EditorialContent({ content }: { content: string }) {
  return <>{content.split('\n\n').map((block, index) => block.startsWith('- ')
    ? <ul key={index}>{block.split('\n').map(line => <li key={line}>{inline(line.replace(/^- /, ''))}</li>)}</ul>
    : <p key={index} style={{ whiteSpace: 'pre-line' }}>{inline(block)}</p>)}</>;
}
