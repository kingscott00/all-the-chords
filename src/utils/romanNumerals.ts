const ROMAN_NUMERALS = [
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
  "XXII",
  "XXIII",
  "XXIV",
];

export function toRomanNumeral(num: number): string {
  if (num < 1 || num > 24) {
    return num.toString();
  }
  return ROMAN_NUMERALS[num];
}

export function fromRomanNumeral(roman: string): number {
  const index = ROMAN_NUMERALS.indexOf(roman.toUpperCase());
  return index > 0 ? index : 0;
}
