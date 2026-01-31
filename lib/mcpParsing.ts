function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapResult(raw: unknown): unknown {
  if (isRecord(raw) && "result" in raw) {
    return raw.result;
  }
  return raw;
}

function getContentArray(raw: unknown): unknown[] | null {
  if (!isRecord(raw)) {
    return null;
  }
  const content = raw.content;
  if (Array.isArray(content)) {
    return content;
  }
  const contents = raw.contents;
  if (Array.isArray(contents)) {
    return contents;
  }
  return null;
}

export function extractTextFromMcpResponse(raw: unknown): string {
  const payload = unwrapResult(raw);
  const contentArray = getContentArray(payload);
  if (!contentArray) {
    return "";
  }

  const texts: string[] = [];
  for (const item of contentArray) {
    if (!isRecord(item)) {
      continue;
    }
    const text = item.text;
    if (typeof text === "string") {
      texts.push(text);
    }
  }

  return texts.join("\n");
}
