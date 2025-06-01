import React, { FC } from 'react';
import { HighlightedText } from '@/search/components/HighlightedText';

export enum TextType {
  BASIC = 0,
  EXAMPLE = 1,
  TAG = 2,
}

export type ParsedTextObj = {
  text: string;
  types: TextType[];
};

const splitRegex = /({|}|<|>)/;

export function definitionToFormatJson(definition: string) {
  const result: ParsedTextObj[] = [];
  const splitted = definition.split(splitRegex);
  const defTypesStack = [];
  let currDefText = '';
  for (const part of splitted) {
    switch (part) {
      case '{':
        defTypesStack.push(TextType.EXAMPLE);
        break;
      case '<':
        defTypesStack.push(TextType.TAG);
        break;
      case '}':
      case '>':
        defTypesStack.pop();
        currDefText = '';
        break;
      default:
        const types = defTypesStack.length > 0 ? [...defTypesStack] : [TextType.BASIC];
        if (types.length == 1 && types[0] === TextType.BASIC && part.length > 0) {
          result.push({ text: part, types });
        } else {
          currDefText += part;
          result.push({ text: currDefText, types });
          currDefText = '';
        }
    }
  }
  return result;
}

type ParsedTextCompProps = {
  text: string;
  highlightOptions?: {
    stringToHighlight?: string;
    backgroundColor?: string;
    color?: string;
  };
};

export const ParsedTextComp: FC<ParsedTextCompProps> = ({ text, highlightOptions }) => {
  return text && text.length > 0 ? (
    <span>
      {definitionToFormatJson(text).map((textObj, i) => {
        const key = `${textObj.text}_${i}_${Math.random()}`;
        const style: React.CSSProperties = {};
        if (textObj.types.includes(TextType.TAG)) {
          style.fontStyle = 'italic';
          style.color = 'gray'; //'#0D4949';
          textObj.text = `(${textObj.text})`;
        }
        if (textObj.types.includes(TextType.EXAMPLE)) {
          style.fontWeight = 'bold';
        }
        return (
          <span key={key} style={style}>
            <HighlightedText
              text={textObj.text}
              stringToHighlight={highlightOptions?.stringToHighlight}
              color={highlightOptions?.color}
              backgroundColor={highlightOptions?.backgroundColor}
            />
          </span>
        );
      })}
    </span>
  ) : null;
};
