/*
 * AeroSense Mobile App - TextScaleContext
 * Dynamic Accessibility Text Enlarger System.
 * Scales typography gracefully across all components:
 * 1.00 = Default (100%)
 * 1.15 = Large (115%)
 * 1.30 = Extra Large (130%)
 */

import React, { createContext, useContext, useState } from 'react';

export const FONT_SCALE_OPTIONS = [
  { id: 'DEFAULT', scale: 1.0, label: 'Standard' },
  { id: 'LARGE', scale: 1.15, label: 'Large' },
  { id: 'XLARGE', scale: 1.3, label: 'Extra Large' },
];

const TextScaleContext = createContext({
  textScale: 1.0,
  setTextScale: () => {},
  scaleText: (size) => size,
});

export function TextScaleProvider({ children, value }) {
  const [internalScale, setInternalScale] = useState(1.0);
  const textScale = value?.textScale !== undefined ? value.textScale : internalScale;
  const setTextScale = value?.setTextScale || setInternalScale;

  const scaleText = (size) => Math.round(size * textScale);

  return (
    <TextScaleContext.Provider value={{ textScale, setTextScale, scaleText }}>
      {children}
    </TextScaleContext.Provider>
  );
}

export function useTextScale() {
  return useContext(TextScaleContext);
}

export default TextScaleContext;
