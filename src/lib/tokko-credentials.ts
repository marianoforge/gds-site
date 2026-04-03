export function getTokkoApiKey(): string | undefined {
  const key = process.env.TOKKO_API_KEY?.trim();
  return key || undefined;
}
