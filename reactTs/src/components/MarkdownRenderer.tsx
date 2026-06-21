import React, { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { Note } from "../App";

type MarkdownRendererProps = {
  markdown: string;
  allNotes: Note[];
};

const WIKI_LINK_RE = /(\[\[[^\]]+\]\])/;

function parseWikiLinks(
  text: string,
  allNotes: Note[],
  onNavigate: (id: string) => void
): React.ReactNode {
  const parts = text.split(WIKI_LINK_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const match = part.match(/^\[\[([^\]]+)\]\]$/);
    if (!match) return <React.Fragment key={i}>{part}</React.Fragment>;
    const title = match[1];
    const target = allNotes.find(
      (n) => n.title.toLowerCase() === title.toLowerCase()
    );
    return target ? (
      <button
        key={i}
        type="button"
        className="note-link"
        onClick={() => onNavigate(target.id)}
        aria-label={`Open note: ${title}`}
      >
        {part}
      </button>
    ) : (
      <span
        key={i}
        className="note-link-broken"
        title={`Note "${title}" not found`}
      >
        {part}
      </span>
    );
  });
}

function withWikiLinks(
  children: React.ReactNode,
  allNotes: Note[],
  onNavigate: (id: string) => void
): React.ReactNode {
  if (typeof children === "string") {
    return parseWikiLinks(children, allNotes, onNavigate);
  }
  if (Array.isArray(children)) {
    return children.map((child, i) =>
      typeof child === "string" ? (
        <React.Fragment key={i}>
          {parseWikiLinks(child, allNotes, onNavigate)}
        </React.Fragment>
      ) : (
        child
      )
    );
  }
  return children;
}

export function MarkdownRenderer({ markdown, allNotes }: MarkdownRendererProps) {
  const navigate = useNavigate();
  const onNavigate = useCallback((id: string) => navigate(`/${id}`), [navigate]);

  const components: Components = {
    p: (props) => (
      <p>{withWikiLinks(props.children, allNotes, onNavigate)}</p>
    ),
    li: (props) => (
      <li>{withWikiLinks(props.children, allNotes, onNavigate)}</li>
    ),
    h1: (props) => (
      <h1>{withWikiLinks(props.children, allNotes, onNavigate)}</h1>
    ),
    h2: (props) => (
      <h2>{withWikiLinks(props.children, allNotes, onNavigate)}</h2>
    ),
    h3: (props) => (
      <h3>{withWikiLinks(props.children, allNotes, onNavigate)}</h3>
    ),
    h4: (props) => (
      <h4>{withWikiLinks(props.children, allNotes, onNavigate)}</h4>
    ),
  };

  return (
    <div className="markdown-content" id="note-markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
