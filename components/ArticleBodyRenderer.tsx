import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface ArticleBodyRendererProps {
  content?: string;
  className?: string;
}

/**
 * Normalizes article content so paragraphs, headings, quotes, and lists
 * are cleanly separated and never collapse into an unreadable continuous block.
 */
function prepareContent(rawText?: string): string {
  if (!rawText) return '';

  let text = rawText.replace(/\r\n/g, '\n').trim();

  // If the text is purely HTML with block elements like <p>, <div>, <h1>-<h6>, return as-is
  const hasHtmlBlocks = /<\s*(?:p|div|h[1-6]|blockquote|ul|ol|table|article|section)\b/i.test(text);
  if (hasHtmlBlocks) {
    return text;
  }

  // If text has HTML tags like <br> or <br/>, convert them to newlines for markdown
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Split into lines to inspect
  const lines = text.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line is a standalone heading or question that acts as a section header
    // e.g., "Яагаад 40,000 жилийн дараа ч ийм сайн хадгалагдсан бэ?"
    const isQuestionHeading = 
      /^(?:Яагаад|Тэгвэл|Энэ|Цус|Хэрхэн|Юу|Ямар|Хэзээ|Хэн|Хаана)[\s\S]{5,100}(?:\?|бэ\?|вэ\?|үү\?|үү|уу\?|уу)$/i.test(trimmed) &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('>');

    if (isQuestionHeading && !lines[i - 1]?.trim().startsWith('#')) {
      // Elevate standalone question lines to clean subheadings if appropriate
      processedLines.push('');
      processedLines.push(`### ${trimmed}`);
      processedLines.push('');
      continue;
    }

    processedLines.push(line);
  }

  text = processedLines.join('\n');

  // Ensure paragraphs have double newlines so CommonMark recognizes them as distinct <p> tags
  // Replace single newlines between text lines with double newlines (unless it's a list item, blockquote, or heading)
  const paragraphBlocks = text.split(/\n{2,}/);
  const formattedBlocks = paragraphBlocks.map(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return '';
    
    // If it's a list, heading, blockquote, keep line breaks intact
    if (/^(?:[-*+]|\d+\.|#|>)/m.test(trimmedBlock)) {
      return trimmedBlock;
    }
    
    // If someone pasted single newlines within a paragraph, convert them to double newlines
    // so every intended break becomes an elegant, spaced paragraph
    return trimmedBlock.split('\n').map(l => l.trim()).filter(Boolean).join('\n\n');
  });

  return formattedBlocks.filter(Boolean).join('\n\n');
}

export const ArticleBodyRenderer: React.FC<ArticleBodyRendererProps> = ({ content = '', className = '' }) => {
  if (!content) return null;

  const hasHtmlBlocks = /<\s*(?:p|div|h[1-6]|blockquote|ul|ol|table|article|section)\b/i.test(content);

  if (hasHtmlBlocks) {
    return (
      <div 
        className={`article-content-body prose-custom text-text-main/90 text-lg md:text-xl leading-[1.85] font-normal space-y-6
          [&_p]:mb-6 md:[&_p]:mb-8 [&_p]:leading-[1.9] [&_p]:text-text-main/90 [&_p]:text-lg md:[&_p]:text-xl
          [&_h1]:text-3xl md:[&_h1]:text-4xl [&_h1]:font-black [&_h1]:text-text-main [&_h1]:mt-12 [&_h1]:mb-6 [&_h1]:tracking-tight
          [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-text-main [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:tracking-tight [&_h2]:border-b [&_h2]:border-border/60 [&_h2]:pb-3
          [&_h3]:text-xl md:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-text-main [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:tracking-tight
          [&_h4]:text-lg md:[&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-text-main [&_h4]:mt-8 [&_h4]:mb-3
          [&_blockquote]:border-l-4 [&_blockquote]:border-brand-purple [&_blockquote]:bg-surfaceHighlight/60 [&_blockquote]:py-5 [&_blockquote]:px-7 [&_blockquote]:rounded-r-2xl [&_blockquote]:my-8 [&_blockquote]:italic [&_blockquote]:text-text-main/95 [&_blockquote]:text-xl [&_blockquote]:shadow-sm
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-3 [&_ul]:my-6 [&_ul]:text-lg md:[&_ul]:text-xl
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-3 [&_ol]:my-6 [&_ol]:text-lg md:[&_ol]:text-xl
          [&_li]:leading-relaxed
          [&_strong]:font-bold [&_strong]:text-text-main
          [&_em]:italic [&_em]:text-text-main/95
          [&_img]:rounded-2xl [&_img]:my-8 [&_img]:w-full [&_img]:max-h-[550px] [&_img]:object-cover [&_img]:shadow-xl [&_img]:border [&_img]:border-border
          [&_hr]:border-border [&_hr]:my-10
          [&_a]:text-brand-purple [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-brand-orange transition-colors
          ${className}
        `}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const normalized = prepareContent(content);

  return (
    <div className={`article-content-body space-y-6 text-text-main/90 text-lg md:text-xl leading-[1.85] font-normal ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => (
            <p className="mb-6 md:mb-8 leading-[1.85] md:leading-[1.9] text-lg md:text-xl text-text-main/90 font-normal tracking-normal selection:bg-brand-purple/20">
              {children}
            </p>
          ),
          h1: ({ children }) => (
            <h1 className="text-3xl md:text-4xl font-black text-text-main mt-12 mb-6 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl md:text-3xl font-bold text-text-main mt-12 mb-5 tracking-tight border-b border-border/60 pb-3 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-gradient-brand rounded-full inline-block flex-shrink-0" />
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl md:text-2xl font-bold text-text-main mt-10 mb-4 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange inline-block flex-shrink-0" />
              <span>{children}</span>
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg md:text-xl font-bold text-text-main mt-8 mb-3 tracking-tight">
              {children}
            </h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-purple bg-surfaceHighlight/70 py-5 px-7 rounded-r-2xl my-8 italic text-text-main/95 font-serif text-xl md:text-2xl leading-relaxed shadow-sm border-y-0 border-r-0">
              <div className="text-brand-purple/40 font-serif text-4xl leading-none mb-1 select-none">“</div>
              <div className="relative z-10">{children}</div>
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-3 my-6 text-lg md:text-xl text-text-main/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-3 my-6 text-lg md:text-xl text-text-main/90 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-text-main">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-text-main/95">
              {children}
            </em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-purple hover:text-brand-orange font-semibold underline underline-offset-4 transition-colors"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <figure className="my-10">
              <img
                src={typeof src === 'string' ? src : ''}
                alt={alt || ''}
                className="rounded-2xl w-full max-h-[550px] object-cover shadow-xl border border-border"
                loading="lazy"
              />
              {alt && (
                <figcaption className="text-center text-sm text-text-muted mt-3 font-light italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          hr: () => (
            <div className="my-12 flex items-center justify-center gap-2">
              <div className="w-12 h-px bg-border" />
              <div className="w-2 h-2 rounded-full bg-brand-purple/40" />
              <div className="w-12 h-px bg-border" />
            </div>
          ),
          code: ({ children }) => (
            <code className="px-2 py-0.5 bg-surfaceHighlight border border-border rounded-md text-sm font-mono text-brand-orange">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="p-4 bg-[#0F172A] border border-border rounded-2xl overflow-x-auto my-6 text-sm font-mono text-slate-200">
              {children}
            </pre>
          )
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
};
