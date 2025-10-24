import React from 'react';
import { Button } from '../../../../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from '../../../../ui/dropdown-menu';
import { Slider } from '../../../../ui/slider';
import { Music, Settings, Text, AlignLeft } from 'lucide-react';
import { TEXT_STYLE_MENU_STYLES } from './TextStyleMenu.styles';
import { TEXT_PREFERENCES_LABELS, TEXT_PREFERENCES_VALUES } from './TextStyleMenu.constants';
import { getFontSpacingDisplay, isViewModeActive, isFontStyleActive } from './TextStyleMenu.utils';
import type { TextStyleMenuProps } from './TextStyleMenu.types';

/**
 * TextStyleMenu component for managing text display preferences
 * Provides controls for view mode, font style, font size, and font spacing
 * 
 * @param props - TextStyleMenuProps containing all preference values and setters
 */
const TextStyleMenu: React.FC<TextStyleMenuProps> = ({
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
  title = "Style",
  variant = 'desktop',
  buttonClassName,
  iconSize = 16,
  dropdownAlign = 'start',
  dropdownClassName,
}) => {
  // Determine styling based on variant
  const isMobile = variant === 'mobile';
  const containerClassName = isMobile ? '' : 'flex flex-col items-center gap-1';
  const triggerButtonClassName = buttonClassName || (isMobile ? 'h-10 w-10' : TEXT_STYLE_MENU_STYLES.triggerButton);
  const settingsIconClassName = isMobile ? '' : TEXT_STYLE_MENU_STYLES.settingsIcon;
  const contentAlign = dropdownAlign;
  const contentClassName = dropdownClassName || (isMobile ? 'mr-4' : '');

  return (
    <div className={containerClassName}>
      {!isMobile && <span className="text-xs text-muted-foreground">{title}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={triggerButtonClassName} title={isMobile ? "Text Preferences" : undefined}>
            <Settings size={iconSize} className={settingsIconClassName} />
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align={contentAlign} className={contentClassName}>
        <div className={TEXT_STYLE_MENU_STYLES.sectionContainer}>
          <div className={TEXT_STYLE_MENU_STYLES.sectionTitle}>{TEXT_PREFERENCES_LABELS.viewMode}</div>
          <div className={TEXT_STYLE_MENU_STYLES.buttonGroup}>
            <Button 
              variant={isViewModeActive(viewMode, 'normal') ? 'default' : 'outline-solid'} 
              size="sm" 
              className={TEXT_STYLE_MENU_STYLES.viewModeButton} 
              onClick={() => setViewMode('normal')} 
              title={TEXT_PREFERENCES_LABELS.normal}
            >
              <Text size={18} className="text-foreground" />
            </Button>
            <Button 
              variant={isViewModeActive(viewMode, 'chords-only') ? 'default' : 'outline-solid'} 
              size="sm" 
              className={TEXT_STYLE_MENU_STYLES.viewModeButton} 
              onClick={() => setViewMode('chords-only')} 
              title={TEXT_PREFERENCES_LABELS.chords}
            >
              <Music size={18} className="text-foreground" />
            </Button>
            <Button 
              variant={isViewModeActive(viewMode, 'lyrics-only') ? 'default' : 'outline-solid'} 
              size="sm" 
              className={TEXT_STYLE_MENU_STYLES.viewModeButton} 
              onClick={() => setViewMode('lyrics-only')} 
              title={TEXT_PREFERENCES_LABELS.lyrics}
            >
              <AlignLeft size={18} className="text-foreground" />
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        {hideGuitarTabs !== undefined && setHideGuitarTabs && (
          <>
            <DropdownMenuItem onClick={() => setHideGuitarTabs(!hideGuitarTabs)} className={hideGuitarTabs ? 'bg-accent text-accent-foreground' : ''}>
              {hideGuitarTabs ? 'Show Guitar Tabs' : 'Hide Guitar Tabs'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <div className={TEXT_STYLE_MENU_STYLES.sectionContainer}>
          <div className={TEXT_STYLE_MENU_STYLES.sectionTitle}>{TEXT_PREFERENCES_LABELS.fontStyle}</div>
          <div className={TEXT_STYLE_MENU_STYLES.buttonGroup}>
            <Button 
              variant={isFontStyleActive(fontStyle, 'serif') ? 'default' : 'outline-solid'} 
              size="sm" 
              className={TEXT_STYLE_MENU_STYLES.fontStyleButton} 
              onClick={() => setFontStyle('serif')}
            >
              {TEXT_PREFERENCES_LABELS.serif}
            </Button>
            <Button 
              variant={isFontStyleActive(fontStyle, 'sans-serif') ? 'default' : 'outline-solid'} 
              size="sm" 
              className={TEXT_STYLE_MENU_STYLES.fontStyleButton} 
              onClick={() => setFontStyle('sans-serif')}
            >
              {TEXT_PREFERENCES_LABELS.sansSerif}
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className={TEXT_STYLE_MENU_STYLES.sliderSection}>
          <div className={TEXT_STYLE_MENU_STYLES.sectionTitle}>{TEXT_PREFERENCES_LABELS.fontSize}</div>
          <div className={TEXT_STYLE_MENU_STYLES.sliderContainer}>
            <Slider
              value={[fontSize]}
              min={TEXT_PREFERENCES_VALUES.fontSizes.min}
              max={TEXT_PREFERENCES_VALUES.fontSizes.max}
              step={TEXT_PREFERENCES_VALUES.fontSizes.step}
              onValueChange={(value) => setFontSize(value[0])}
              className={TEXT_STYLE_MENU_STYLES.slider}
            />
            <span className={TEXT_STYLE_MENU_STYLES.valueDisplay}>{fontSize}px</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className={TEXT_STYLE_MENU_STYLES.sliderSection}>
          <div className={TEXT_STYLE_MENU_STYLES.sectionTitle}>{TEXT_PREFERENCES_LABELS.fontSpacing}</div>
          <div className={TEXT_STYLE_MENU_STYLES.sliderContainer}>
            <Slider
              value={[fontSpacing]}
              min={TEXT_PREFERENCES_VALUES.fontSpacing.min}
              max={TEXT_PREFERENCES_VALUES.fontSpacing.max}
              step={TEXT_PREFERENCES_VALUES.fontSpacing.step}
              onValueChange={(value) => setFontSpacing(value[0])}
              className={TEXT_STYLE_MENU_STYLES.slider}
            />
            <span className={TEXT_STYLE_MENU_STYLES.valueDisplay}>
              {getFontSpacingDisplay(fontSpacing)}
            </span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
};

export default TextStyleMenu;
