import React, { useState, useRef, useCallback, useMemo } from 'react';
import { ChordEditProps } from './types';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import ChordContent from './ChordContent';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollDetection } from '@/hooks/use-scroll-detection';
import ChordEditToolbar from './ChordEditToolbar';
import ChordRenderer from './ChordRenderer';
import { processContent } from '@/utils/chordProcessingUtils';

/**
 * ChordEdit - A component for editing and previewing chord sheets
 * This is the main component for the chord sheet editor
 */
const ChordEdit: React.FC<ChordEditProps> = ({
  editContent,
  setEditContent,
  handleSaveEdits,
  onReturn
}) => {
  // Component state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Display settings - using constants since they don't change in this component
  const fontSize = 16;
  const fontStyle = '';
  const fontSpacing = 0;
  const lineHeight = 1.0;
  const viewMode = 'normal';
  const hideGuitarTabs = false;
  
  // Refs and hooks
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Memoize processed content to avoid unnecessary recalculations
  const processedContent = useMemo(() => 
    processContent(editContent), 
    [editContent]
  );
  
  // Use scroll detection hook to observe content changes
  useScrollDetection(
    contentRef, 
    [isPreviewMode, processedContent]
  );

  // Event handlers
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  // Render chord with tooltip/popover
  const renderChord = useCallback((chord: string) => {
    return <ChordRenderer chordName={chord.trim()} isMobile={isMobile} />;
  }, [isMobile]);

  return (
    <div 
      className={`w-full mx-auto flex flex-col transition-all duration-200 ${
        isFullScreen ? 'fixed inset-0 bg-background z-50' : 'max-w-3xl h-[calc(100vh-12rem)]'
      }`}
    >
      <Card className={`mb-4 ${isFullScreen ? 'rounded-none' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          <ChordEditToolbar 
            isPreviewMode={isPreviewMode}
            isFullScreen={isFullScreen}
            onTogglePreview={togglePreviewMode}
            onToggleFullScreen={toggleFullScreen}
            onSave={handleSaveEdits}
            onReturn={onReturn}
          />
        </CardContent>
      </Card>
      
      {isPreviewMode ? (
        <div 
          ref={contentRef}
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: '#F8F9FA',
            padding: '1rem',
            borderRadius: isFullScreen ? '0' : '0.375rem'
          }}
        >
          <ChordContent
            processedContent={processedContent}
            fontSize={fontSize}
            fontSpacing={fontSpacing}
            fontStyle={fontStyle}
            lineHeight={lineHeight}
            viewMode={viewMode}
            hideGuitarTabs={hideGuitarTabs}
            renderChord={renderChord}
          />
        </div>
      ) : (
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className={`flex-1 font-mono text-sm resize-none ${isFullScreen ? 'rounded-none' : ''}`}
        />
      )}
    </div>
  );
};

export default ChordEdit;
