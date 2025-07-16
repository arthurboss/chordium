import React from 'react';
import DesktopControls from './DesktopControls';
import MobileControlsBar from './MobileControlsBar';
import { ChordSheetControlsProps } from './types';

const ChordSheetControls: React.FC<ChordSheetControlsProps> = (props) => {
  return (
    <>
      <DesktopControls {...props} />
      <MobileControlsBar {...props} />
    </>
  );
};

export default ChordSheetControls; 