export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function extractTextFromMcpResponse(raw: unknown): string {
  if (!isRecord(raw)) {
    return "";
  }

  const resultValue = "result" in raw ? raw.result : undefined;
  if (!isRecord(resultValue)) {
    return "";
  }

  const contentValue = "content" in resultValue ? resultValue.content : undefined;
  const contentsValue = "contents" in resultValue ? resultValue.contents : undefined;

  const items = Array.isArray(contentValue)
    ? contentValue
    : Array.isArray(contentsValue)
      ? contentsValue
      : [];

  const texts: string[] = [];
  for (const item of items) {
    if (!isRecord(item)) {
      continue;
    }
    if ("text" in item && typeof item.text === "string") {
      texts.push(item.text);
    }
  }

  return texts.join("\n");
}
