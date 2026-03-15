import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WikiNode } from '../types';

interface FullscreenOverlayProps {
  node: WikiNode | null;
  onClose: () => void;
  children?: React.ReactNode;
  customBackground?: string | null;
}

/**
 * Explicit markdown component map.
 * We intentionally avoid `prose` (from @tailwindcss/typography) because
 * the CDN Tailwind v3 in index.html has no typography plugin — it resets
 * or ignores prose styles entirely. Every element below is self-contained.
 *
 * Headings use PP Editorial Old ultralight (global heading font).
 * Body text uses Atkinson Hyperlegible Next extralight.
 */
const SERIF = "'PP Editorial Old', serif";
const SANS = "'Atkinson Hyperlegible Next', sans-serif";
const FONT = SANS; // shorthand for body elements

const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  // Headings — PP Editorial Old ultralight
  h1: ({ node, ...props }) => (
    <h1 style={{ fontFamily: SERIF, fontWeight: 200, fontSize: '2em', marginBottom: '0.5em', color: '#f4f4f5', lineHeight: 1.2 }} {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 style={{ fontFamily: SERIF, fontWeight: 200, fontSize: '1.5em', marginBottom: '0.4em', marginTop: '1.2em', color: '#e4e4e7', lineHeight: 1.3 }} {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 style={{ fontFamily: SERIF, fontWeight: 200, fontSize: '1.25em', marginBottom: '0.3em', marginTop: '1em', color: '#d4d4d8' }} {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 style={{ fontFamily: SERIF, fontWeight: 200, fontSize: '1.05em', marginBottom: '0.25em', marginTop: '0.8em', color: '#a1a1aa' }} {...props} />
  ),

  // Body text
  p: ({ node, ...props }) => (
    <p style={{ fontFamily: FONT, fontWeight: 200, fontSize: '1.05em', lineHeight: 1.75, marginBottom: '1em', color: '#d4d4d8' }} {...props} />
  ),

  // Lists
  ul: ({ node, ...props }) => (
    <ul style={{ paddingLeft: '1.5em', marginBottom: '1em', listStyleType: 'disc', color: '#d4d4d8' }} {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol style={{ paddingLeft: '1.5em', marginBottom: '1em', listStyleType: 'decimal', color: '#d4d4d8' }} {...props} />
  ),
  li: ({ node, ...props }) => (
    <li style={{ fontFamily: FONT, fontWeight: 200, fontSize: '1.05em', lineHeight: 1.7, marginBottom: '0.25em' }} {...props} />
  ),

  // Blockquote
  blockquote: ({ node, ...props }) => (
    <blockquote style={{ borderLeft: '3px solid rgb(34 197 94 / 0.5)', paddingLeft: '1em', marginLeft: 0, marginBottom: '1em', color: '#a1a1aa', fontStyle: 'italic' }} {...props} />
  ),

  // Code
  code: ({ node, inline, ...props }: any) =>
    inline ? (
      <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.15em 0.35em', borderRadius: '3px', fontSize: '0.88em', fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', monospace", color: 'rgb(34 197 94)' }} {...props} />
    ) : (
      <code style={{ display: 'block', background: 'rgba(0,0,0,0.4)', padding: '1em', overflowX: 'auto', fontSize: '0.88em', fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', monospace", color: '#d4d4d8', lineHeight: 1.6, borderLeft: '2px solid rgb(34 197 94 / 0.4)' }} {...props} />
    ),
  pre: ({ node, ...props }) => (
    <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1em', marginBottom: '1em', overflowX: 'auto', borderRadius: '2px' }} {...props} />
  ),

  // Horizontal rule
  hr: ({ node, ...props }) => (
    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.12)', margin: '1.5em 0' }} {...props} />
  ),

  // Links
  a: ({ node, ...props }) => (
    <a style={{ color: 'rgb(34 197 94)', textDecoration: 'underline', textUnderlineOffset: '3px' }} target="_blank" rel="noopener noreferrer" {...props} />
  ),

  // Strong / Em
  strong: ({ node, ...props }) => (
    <strong style={{ fontWeight: 600, color: '#f4f4f5' }} {...props} />
  ),
  em: ({ node, ...props }) => (
    <em style={{ fontStyle: 'italic', color: '#a1a1aa' }} {...props} />
  ),

  // Tables
  table: ({ node, ...props }) => (
    <div style={{ overflowX: 'auto', marginBottom: '1em', border: '1px solid rgba(255,255,255,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead style={{ background: 'rgba(255,255,255,0.04)' }} {...props} />
  ),
  tbody: ({ node, ...props }) => (
    <tbody {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }} {...props} />
  ),
  th: ({ node, ...props }) => (
    <th style={{ padding: '0.6em 1em', fontSize: '0.8em', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }} {...props} />
  ),
  td: ({ node, ...props }) => (
    <td style={{ padding: '0.55em 1em', fontSize: '0.95em', color: '#d4d4d8', lineHeight: 1.6 }} {...props} />
  ),
};

export const FullscreenOverlay: React.FC<FullscreenOverlayProps> = ({
  node,
  onClose,
  children,
  customBackground
}) => {
  if (!node) return null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  let backgroundStyle: React.CSSProperties = { backgroundColor: '#212325' };
  if (customBackground) {
    backgroundStyle = {
      backgroundImage: `url(${customBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const MarkdownBody = ({ content }: { content: string }) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col" style={backgroundStyle}>
      {/* Backdrop click closes overlay */}
      <div
        className="flex-1 flex items-start justify-center p-10 overflow-y-auto"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <div
          className="w-full max-w-3xl"
          style={{ paddingTop: '2rem', paddingBottom: '4rem' }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Text / Title nodes */}
          {(node.type === 'text' || node.type === 'title') && (
            <div>
              <div style={{
                fontFamily: "'PP Editorial Old', serif",
                fontWeight: 200,
                textAlign: 'center',
                marginBottom: '2.5rem',
                color: '#ffffff',
                fontSize: node.type === 'title' ? '2.5rem' : '1.9rem',
                lineHeight: 1.2,
              }}>
                {node.title}
              </div>
              <MarkdownBody content={node.content} />
            </div>
          )}

          {/* Image nodes */}
          {node.type === 'image' && (
            <div className="flex flex-col items-center">
              <div style={{ fontFamily: "'PP Editorial Old', serif", fontWeight: 200, textAlign: 'center', marginBottom: '1.5rem', color: '#ffffff', fontSize: '1.6rem' }}>
                {node.title}
              </div>
              {node.coverImage && (
                <img
                  src={node.coverImage}
                  alt={node.title}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              )}
              {node.content && (
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#a1a1aa', fontStyle: 'italic', fontFamily: FONT, fontWeight: 200 }}>
                  {node.content}
                </p>
              )}
            </div>
          )}

          {/* Group nodes */}
          {node.type === 'group' && (
            <div>
              <div style={{ fontFamily: "'PP Editorial Old', serif", fontWeight: 200, textAlign: 'center', marginBottom: '2rem', color: '#ffffff', fontSize: '1.9rem', lineHeight: 1.2 }}>
                {node.title}
              </div>
              <MarkdownBody content={node.content} />
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
