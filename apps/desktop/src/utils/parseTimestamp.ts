/**
 *
 * @param str - `X Minutes Y Seconds` フォーマットの文字列を受け取ります。
 */
export function timestampStringToSeconds(str: string): number {
  if (typeof str !== "string") throw new TypeError("Input must be a string");
  const minMatch = str.match(/(\d+)\s*Minutes?/);
  const secMatch = str.match(/(\d+)\s*Seconds?/);

  if (!minMatch || !secMatch) throw new Error("Invalid timestamp format");

  const min = Number(minMatch[1]);
  const sec = Number(secMatch[1]);

  if (Number.isNaN(min) || Number.isNaN(sec)) throw new Error("Invalid timestamp format");

  return min * 60 + sec;
}

export function secondsToMMSSFormat(seconds: number): string {
  if (typeof seconds !== "number" || seconds < 0) throw new TypeError("Input must be a non-negative number");

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
