import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MDXProvider } from '@mdx-js/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { ArrowLeft, ArrowRight, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import { components } from '../mdx-components';

interface MDXComponentItem {
  title: string;
  component: React.ComponentType;
}

interface MarkdownDialogProps {
  trigger: React.ReactNode;
  markdownFiles?: string[];
  mdxComponents?: MDXComponentItem[];
  className?: string;
  title: string;
}

interface MarkdownContent {
  title: string;
  content?: string;
  id: string;
  Component?: React.ComponentType;
}

interface DialogMainProps {
  contentRef: React.RefObject<HTMLDivElement>;
  markdownContents: MarkdownContent[];
  currentSectionIndex: number;
  shouldScroll: boolean;
  isAtBottom: boolean;
  scrollToToggle: () => void;
}

const DialogMain: React.FC<DialogMainProps> = ({
  contentRef,
  markdownContents,
  currentSectionIndex,
  shouldScroll,
  isAtBottom,
  scrollToToggle,
}) => {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <div
      ref={contentRef}
      className="flex overflow-x-hidden"
    >
      {markdownContents.length > 0 && markdownContents.map((section, index) => (
        <div
          key={section.id}
          id={section.id.substring(1)}
          className={`snap-center pt-4 w-full flex-shrink-0 overflow-y-auto no-scrollbar ${shouldScroll ? 'pb-8' : ''}`}
          ref={el => sectionRefs.current[index] = el}
        >
          <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
            {section.Component ? (
              <MDXProvider components={components}>
                <section.Component />
              </MDXProvider>
            ) : (
              <ReactMarkdown components={components}>
                {section.content || ''}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}

      {shouldScroll && (
        <>
          {!isAtBottom && (
            <div className="absolute bottom-[3.5rem] left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          )}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-[calc(100%-3.5rem)] left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-8 h-8 shadow-md bg-background"
            onClick={scrollToToggle}
            aria-label={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
          >
            {isAtBottom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </>
      )}
    </div>
  );
};

interface DialogFooterProps {
  navigateSection: (direction: 'next' | 'prev' | 'reset') => void;
  currentSectionIndex: number;
  markdownContents: MarkdownContent[];
  getNextSectionTitle: () => string;
}

const DialogFooter: React.FC<DialogFooterProps> = ({
  navigateSection,
  currentSectionIndex,
  markdownContents,
  getNextSectionTitle,
}) => {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] border-t">
      <div className="grid grid-cols-[auto_0.95fr] gap-2 items-center">
        {currentSectionIndex > 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            onClick={() => navigateSection('prev')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-8 h-8"></div>
        )}
        <span className="text-sm text-muted-foreground">
          {`${currentSectionIndex + 1} / ${markdownContents.length}`}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-center">
        <span className="text-sm text-muted-foreground truncate">
          {getNextSectionTitle()}
        </span>
        {currentSectionIndex !== markdownContents.length - 1 ? (
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            onClick={() => navigateSection('next')}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            onClick={() => navigateSection('reset')}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const MarkdownDialog: React.FC<MarkdownDialogProps> = ({
  trigger,
  markdownFiles = [],
  mdxComponents = [],
  className,
  title,
}) => {
  const [markdownContents, setMarkdownContents] = useState<MarkdownContent[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mdxComponents && mdxComponents.length > 0) {
      const contents = mdxComponents.map((item) => ({
        title: item.title,
        id: `#${item.title.toLowerCase().replace(/\s+/g, '-')}`,
        Component: item.component,
      }));
      setMarkdownContents(contents);
      return;
    }

    const loadMarkdownFiles = async () => {
      const contents = await Promise.all(
        markdownFiles.map(async (filePath) => {
          try {
            const response = await fetch(filePath);
            if (!response.ok) {
              console.error(`Failed to load markdown file: ${filePath}`);
              return {
                title: 'Error',
                content: 'Failed to load content',
                id: '#error',
              };
            }

            const text = await response.text();

            const titleMatch = text.match(/^# (.+)$/m);
            const title = titleMatch ? titleMatch[1] : 'Untitled';

            const id = `#${title.toLowerCase().replace(/\s+/g, '-')}`;
            
            return {
              title,
              content: text.replace(/^# .+$/m, ''),
              id,
            };
          } catch (error) {
            console.error(`Error loading markdown file: ${filePath}`, error);
            return {
              title: 'Error',
              content: 'Failed to load content',
              id: '#error',
            };
          }
        })
      );

      setMarkdownContents(contents);
    };

    loadMarkdownFiles();
  }, [markdownFiles, mdxComponents]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setCurrentSectionIndex(0);
      setShouldScroll(false);
      setIsAtBottom(false);

      if (contentRef.current) {
        contentRef.current.scrollLeft = 0;
        const sections = contentRef.current.children;
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i] as HTMLElement;
          if (section) {
            section.scrollTop = 0;
          }
        }
      }
    }
  };

  const checkScrollStatus = () => {
    if (contentRef.current) {
      const sections = contentRef.current.children;
      if (sections.length > 0) {
        const currentSection = sections[currentSectionIndex] as HTMLElement;
        if (currentSection) {
          const hasScrollableContent = currentSection.scrollHeight > currentSection.clientHeight + 5;

          const scrollTop = currentSection.scrollTop;
          const clientHeight = currentSection.clientHeight;
          const scrollHeight = currentSection.scrollHeight;

          const atBottom = scrollHeight - scrollTop <= clientHeight + 10;

          setShouldScroll(hasScrollableContent);
          setIsAtBottom(hasScrollableContent && atBottom);

          return hasScrollableContent;
        }
      }
    }
    setShouldScroll(false);
    setIsAtBottom(false);
    return false;
  };

  const scrollToToggle = () => {
    if (contentRef.current) {
      const sections = contentRef.current.children;
      if (sections.length > 0) {
        const currentSection = sections[currentSectionIndex] as HTMLElement;
        if (currentSection) {
          if (isAtBottom) {
            currentSection.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          } else {
            currentSection.scrollTo({
              top: currentSection.scrollHeight,
              behavior: 'smooth'
            });
          }
          setTimeout(checkScrollStatus, 100);
        }
      }
    }
  };

  useEffect(() => {
    setShouldScroll(false);
    setIsAtBottom(false);

    if (contentRef.current) {
      const sections = contentRef.current.children;
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        if (section) {
          section.scrollTop = 0;
        }
      }
    }

    setTimeout(checkScrollStatus, 50);

  }, [currentSectionIndex]);

  useEffect(() => {
    const handleScroll = () => {
      checkScrollStatus();
    };

    const currentSection = contentRef.current?.children[currentSectionIndex] as HTMLElement;
    if (currentSection) {
      currentSection.addEventListener('scroll', handleScroll);
    }

    checkScrollStatus();

    const resizeObserver = new ResizeObserver(() => {
      checkScrollStatus();
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      if (currentSection) {
        currentSection.removeEventListener('scroll', handleScroll);
      }
      resizeObserver.disconnect();
    };
  }, [currentSectionIndex, markdownContents]);

  const navigateSection = (direction: 'next' | 'prev' | 'reset') => {
    if (markdownContents.length === 0) return;

    setShouldScroll(false);
    setIsAtBottom(false);

    let newIndex;
    if (direction === 'next') {
      newIndex = currentSectionIndex < markdownContents.length - 1 ? currentSectionIndex + 1 : 0;
    } else if (direction === 'prev') {
      newIndex = currentSectionIndex > 0 ? currentSectionIndex - 1 : markdownContents.length - 1;
    } else {
      newIndex = 0;
    }

    setCurrentSectionIndex(newIndex);

    if (contentRef.current) {
      contentRef.current.scrollTo({
        left: newIndex * contentRef.current.clientWidth,
        behavior: 'smooth'
      });

      const sections = contentRef.current.children;
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        if (section) {
          section.scrollTop = 0;
        }
      }
    }
  };

  const getNextSectionTitle = () => {
    if (markdownContents.length === 0) return '';

    // If we're on the last page, don't show "Next: [title]"
    if (currentSectionIndex === markdownContents.length - 1) return '';
    
    const nextIndex = currentSectionIndex < markdownContents.length - 1 ? currentSectionIndex + 1 : 0;
    return `Next: ${markdownContents[nextIndex]?.title || ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogMain
          contentRef={contentRef}
          markdownContents={markdownContents}
          currentSectionIndex={currentSectionIndex}
          shouldScroll={shouldScroll}
          isAtBottom={isAtBottom}
          scrollToToggle={scrollToToggle}
        />

        <DialogFooter
          navigateSection={navigateSection}
          currentSectionIndex={currentSectionIndex}
          markdownContents={markdownContents}
          getNextSectionTitle={getNextSectionTitle}
        />
      </DialogContent>
    </Dialog>
  );
};

export { MarkdownDialog };