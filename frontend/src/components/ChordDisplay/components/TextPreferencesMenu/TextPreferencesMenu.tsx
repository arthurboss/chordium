import React from 'react';
import { Button } from '../../../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from '../../../ui/dropdown-menu';
import { Slider } from '../../../ui/slider';
import { Music, Settings, Text, AlignLeft } from 'lucide-react';
import { TEXT_PREFERENCES_STYLES, TEXT_PREFERENCES_LABELS, TEXT_PREFERENCES_VALUES } from './TextPreferencesMenu.constants';
import { getFontSpacingDisplay, isViewModeActive, isFontStyleActive } from './TextPreferencesMenu.utils';
import type { TextPreferencesMenuProps } from './TextPreferencesMenu.types';

/**
 * TextPreferencesMenu component for managing text display preferences
 * Provides controls for view mode, font style, font size, and font spacing
 * 
 * @param props - TextPreferencesMenuProps containing all preference values and setters
 */
const TextPreferencesMenu: React.FC<TextPreferencesMenuProps> = ({
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
  viewMode,
  setViewMode,
  title = "Style",
}) => {
  return (
    <div className='flex flex-col items-center gap-1'>
      <span className="text-xs text-muted-foreground">{title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={TEXT_PREFERENCES_STYLES.triggerButton}>
            <Settings size={16} className={TEXT_PREFERENCES_STYLES.settingsIcon} />
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <div className={TEXT_PREFERENCES_STYLES.sectionContainer}>
          <div className={TEXT_PREFERENCES_STYLES.sectionTitle}>{TEXT_PREFERENCES_LABELS.viewMode}</div>
          <div className={TEXT_PREFERENCES_STYLES.buttonGroup}>
            <Button 
              variant={isViewModeActive(viewMode, 'normal') ? 'default' : 'outline'} 
              size="sm" 
              className={TEXT_PREFERENCES_STYLES.viewModeButton} 
              onClick={() => setViewMode('normal')} 
              title={TEXT_PREFERENCES_LABELS.normal}
            >
              <Text size={18} className="text-foreground" />
            </Button>
            <Button 
              variant={isViewModeActive(viewMode, 'chords-only') ? 'default' : 'outline'} 
              size="sm" 
              className={TEXT_PREFERENCES_STYLES.viewModeButton} 
              onClick={() => setViewMode('chords-only')} 
              title={TEXT_PREFERENCES_LABELS.chords}
            >
              <Music size={18} className="text-foreground" />
            </Button>
            <Button 
              variant={isViewModeActive(viewMode, 'lyrics-only') ? 'default' : 'outline'} 
              size="sm" 
              className={TEXT_PREFERENCES_STYLES.viewModeButton} 
              onClick={() => setViewMode('lyrics-only')} 
              title={TEXT_PREFERENCES_LABELS.lyrics}
            >
              <AlignLeft size={18} className="text-foreground" />
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className={TEXT_PREFERENCES_STYLES.sectionContainer}>
          <div className={TEXT_PREFERENCES_STYLES.sectionTitle}>{TEXT_PREFERENCES_LABELS.fontStyle}</div>
          <div className={TEXT_PREFERENCES_STYLES.buttonGroup}>
            <Button 
              variant={isFontStyleActive(fontStyle, 'serif') ? 'default' : 'outline'} 
              size="sm" 
              className={TEXT_PREFERENCES_STYLES.fontStyleButton} 
              onClick={() => setFontStyle('serif')}
            >
              {TEXT_PREFERENCES_LABELS.serif}
            </Button>
            <Button 
              variant={isFontStyleActive(fontStyle, 'sans-serif') ? 'default' : 'outline'} 
              size="sm" 
              className={TEXT_PREFERENCES_STYLES.fontStyleButton} 
              onClick={() => setFontStyle('sans-serif')}
            >
              {TEXT_PREFERENCES_LABELS.sansSerif}
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className={TEXT_PREFERENCES_STYLES.sliderSection}>
          <div className={TEXT_PREFERENCES_STYLES.sectionTitle}>{TEXT_PREFERENCES_LABELS.fontSize}</div>
          <div className={TEXT_PREFERENCES_STYLES.sliderContainer}>
            <Slider
              value={[fontSize]}
              min={TEXT_PREFERENCES_VALUES.fontSizes.min}
              max={TEXT_PREFERENCES_VALUES.fontSizes.max}
              step={TEXT_PREFERENCES_VALUES.fontSizes.step}
              onValueChange={(value) => setFontSize(value[0])}
              className={TEXT_PREFERENCES_STYLES.slider}
            />
            <span className={TEXT_PREFERENCES_STYLES.valueDisplay}>{fontSize}px</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className={TEXT_PREFERENCES_STYLES.sliderSection}>
          <div className={TEXT_PREFERENCES_STYLES.sectionTitle}>{TEXT_PREFERENCES_LABELS.fontSpacing}</div>
          <div className={TEXT_PREFERENCES_STYLES.sliderContainer}>
            <Slider
              value={[fontSpacing]}
              min={TEXT_PREFERENCES_VALUES.fontSpacing.min}
              max={TEXT_PREFERENCES_VALUES.fontSpacing.max}
              step={TEXT_PREFERENCES_VALUES.fontSpacing.step}
              onValueChange={(value) => setFontSpacing(value[0])}
              className={TEXT_PREFERENCES_STYLES.slider}
            />
            <span className={TEXT_PREFERENCES_STYLES.valueDisplay}>
              {getFontSpacingDisplay(fontSpacing)}
            </span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
};

export default TextPreferencesMenu;
