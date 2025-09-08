import { useCallback } from 'react';

interface UseCapoTransposeProps {
  capo: number;
  setCapo: (capo: number) => void;
  transpose: number;
  setTranspose: (transpose: number) => void;
  capoTransposeLinked?: boolean;
}

interface CapoTransposeHandlers {
  handleCapoChange: (newCapo: number) => void;
  handleTransposeChange: (newTranspose: number) => void;
  getCapoDisableStates: () => { disableIncrement: boolean; disableDecrement: boolean };
  getTransposeDisableStates: () => { disableIncrement: boolean; disableDecrement: boolean };
}

export const useCapoTranspose = ({
  capo,
  setCapo,
  transpose,
  setTranspose,
  capoTransposeLinked = false,
}: UseCapoTransposeProps): CapoTransposeHandlers => {
  const handleCapoChange = useCallback((newCapo: number) => {
    setCapo(newCapo);

    // If linked, adjust transpose inversely
    if (capoTransposeLinked) {
      const capoDifference = newCapo - capo;
      const newTranspose = transpose - capoDifference;
      
      // Clamp transpose to valid range (-11 to +11)
      const clampedTranspose = Math.max(-11, Math.min(11, newTranspose));
      
      setTranspose(clampedTranspose);
    }
  }, [capo, transpose, setCapo, setTranspose, capoTransposeLinked]);

  const handleTransposeChange = useCallback((newTranspose: number) => {
    setTranspose(newTranspose);

    // If linked, adjust capo inversely
    if (capoTransposeLinked) {
      const transposeDifference = newTranspose - transpose;
      const newCapo = capo - transposeDifference;
      
      // Clamp capo to valid range (0-11)
      const clampedCapo = Math.max(0, Math.min(11, newCapo));
      
      setCapo(clampedCapo);
    }
  }, [capo, transpose, setCapo, setTranspose, capoTransposeLinked]);

  const getCapoDisableStates = useCallback(() => {
    if (!capoTransposeLinked) {
      return { disableIncrement: capo >= 11, disableDecrement: capo <= 0 };
    }

    // When linked, consider both capo and transpose limits
    return {
      disableIncrement: capo >= 11 || transpose <= -11,
      disableDecrement: capo <= 0 || transpose >= 11
    };
  }, [capo, transpose, capoTransposeLinked]);

  const getTransposeDisableStates = useCallback(() => {
    if (!capoTransposeLinked) {
      return { disableIncrement: transpose >= 11, disableDecrement: transpose <= -11 };
    }

    // When linked, consider both capo and transpose limits
    return {
      disableIncrement: transpose >= 11 || capo <= 0,
      disableDecrement: transpose <= -11 || capo >= 11
    };
  }, [capo, transpose, capoTransposeLinked]);

  return {
    handleCapoChange,
    handleTransposeChange,
    getCapoDisableStates,
    getTransposeDisableStates,
  };
};
