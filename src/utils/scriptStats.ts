/** 统计脚本文稿：空格与各类空白不计入「字数」；汉字、英文词、数字串、标点各计 1；标点另计「标点符号数」。 */

export type ScriptStats = {
  /** 字数：每个汉字、每个连续英文单词、每个连续数字串、每个标点各算 1；空白不算 */
  unitCount: number;
  /** Unicode 标点（General Category P*）个数 */
  punctuationCount: number;
  /** 按换行符分隔的行数；空文稿为 0 行 */
  lineCount: number;
};

function isWhiteSpaceChar(ch: string): boolean {
  return /\p{White_Space}/u.test(ch);
}

function isHanChar(ch: string): boolean {
  return /\p{Script=Han}/u.test(ch);
}

function isPunctuationChar(ch: string): boolean {
  return /\p{P}/u.test(ch);
}

function isAsciiLetter(ch: string): boolean {
  return ch >= "A" && ch <= "Z" || ch >= "a" && ch <= "z";
}

function isDecimalDigitChar(ch: string): boolean {
  return /\p{Nd}/u.test(ch);
}

export function computeScriptStats(script: string): ScriptStats {
  const lineCount = script.length === 0 ? 0 : script.split(/\r?\n/u).length;

  let unitCount = 0;
  let punctuationCount = 0;

  for (let i = 0; i < script.length; ) {
    const cp = script.codePointAt(i)!;
    const ch = String.fromCodePoint(cp);
    const w = cp > 0xffff ? 2 : 1;

    if (isWhiteSpaceChar(ch)) {
      i += w;
      continue;
    }

    if (isHanChar(ch)) {
      unitCount += 1;
      i += w;
      continue;
    }

    if (isPunctuationChar(ch)) {
      unitCount += 1;
      punctuationCount += 1;
      i += w;
      continue;
    }

    if (isAsciiLetter(ch)) {
      unitCount += 1;
      i += w;
      while (i < script.length) {
        const cp2 = script.codePointAt(i)!;
        const ch2 = String.fromCodePoint(cp2);
        const w2 = cp2 > 0xffff ? 2 : 1;
        if (isAsciiLetter(ch2)) {
          i += w2;
          continue;
        }
        if (ch2 === "'" || ch2 === "’") {
          const next = i + w2 < script.length ? String.fromCodePoint(script.codePointAt(i + w2)!) : "";
          if (isAsciiLetter(next)) {
            i += w2;
            continue;
          }
        }
        break;
      }
      continue;
    }

    if (isDecimalDigitChar(ch)) {
      unitCount += 1;
      i += w;
      while (i < script.length) {
        const cp2 = script.codePointAt(i)!;
        const ch2 = String.fromCodePoint(cp2);
        const w2 = cp2 > 0xffff ? 2 : 1;
        if (isDecimalDigitChar(ch2)) {
          i += w2;
        } else {
          break;
        }
      }
      continue;
    }

    unitCount += 1;
    i += w;
  }

  return { unitCount, punctuationCount, lineCount };
}
