import { useState, useEffect, useRef } from 'react';

interface UseCapoMenuProps {
  capo: number;
  setCapo: (value: number) => void;
  defaultCapo?: number;
}

export const useCapoMenu = ({ capo, setCapo, defaultCapo = 0 }: UseCapoMenuProps) => {
  const [uiCapoLevel, setUiCapoLevel] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down'>('up');
  const prevCapoRef = useRef(capo);

  // Update UI level when capo changes externally
  useEffect(() => {
    const newUiLevel = capo - defaultCapo;
    setUiCapoLevel(newUiLevel);
  }, [capo, defaultCapo]);

  const isAltered = capo !== defaultCapo;

  const handleIncrement = () => {
    if (capo < 11) {
      const newCapo = Math.min(11, capo + 1); // Ensure capo doesn't go above 11
      setAnimationDirection('up');
      setCapo(newCapo);
      setUiCapoLevel(newCapo - defaultCapo);
      prevCapoRef.current = capo;
    }
  };

  const handleDecrement = () => {
    if (capo > 0) {
      const newCapo = Math.max(0, capo - 1); // Ensure capo doesn't go below 0
      setAnimationDirection('down');
      setCapo(newCapo);
      setUiCapoLevel(newCapo - defaultCapo);
      prevCapoRef.current = capo;
    }
  };

  const handleReset = () => {
    setCapo(defaultCapo);
    setUiCapoLevel(0);
  };

  return {
    uiCapoLevel,
    isAltered,
    handleIncrement,
    handleDecrement,
    handleReset,
    disableIncrement: capo >= 11,
    disableDecrement: capo <= 0,
    animationDirection
  };
};
