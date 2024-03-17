import React, { FC } from 'react';

type HighlightedTextProps = {
  text: string;
  stringToHighlight?: string;
  backgroundColor?: string;
  color?: string;
};

export const HighlightedText: FC<HighlightedTextProps> = ({
  text,
  stringToHighlight,
  backgroundColor,
  color,
}) => {
  if (stringToHighlight === undefined || stringToHighlight === null) {
    return text;
  }
  // use regex for case insensitive replace and highlight
  const regex = new RegExp(`(${stringToHighlight})`, 'ig');
  return (
    <span>
      {text
        .replaceAll(regex, `__mark__$1__mark__`)
        .split('__mark__')
        .map((str) =>
          regex.test(str) ? (
            <mark key={`highlight_${str}_${Math.random()}`} style={{ backgroundColor, color }}>
              {str}
            </mark>
          ) : (
            str
          ),
        )}
    </span>
  );
};
