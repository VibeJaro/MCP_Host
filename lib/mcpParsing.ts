export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type McpContentItem = {
  text?: string;
  mimeType?: string;
  uri?: string;
  type?: string;
};

function extractItems(raw: unknown): unknown[] {
  if (!isRecord(raw)) {
    return [];
  }

  const resultValue = "result" in raw ? raw.result : undefined;
  if (!isRecord(resultValue)) {
    return [];
  }

  const contentValue = "content" in resultValue ? resultValue.content : undefined;
  const contentsValue = "contents" in resultValue ? resultValue.contents : undefined;

  if (Array.isArray(contentValue)) {
    return contentValue;
  }
  if (Array.isArray(contentsValue)) {
    return contentsValue;
  }

  return [];
}

export function extractMcpContents(raw: unknown): McpContentItem[] {
  const items = extractItems(raw);
  const output: McpContentItem[] = [];

  for (const item of items) {
    if (!isRecord(item)) {
      continue;
    }
    const entry: McpContentItem = {};
    if ("text" in item && typeof item.text === "string") {
      entry.text = item.text;
    }
    if ("mimeType" in item && typeof item.mimeType === "string") {
      entry.mimeType = item.mimeType;
    }
    if ("uri" in item && typeof item.uri === "string") {
      entry.uri = item.uri;
    }
    if ("type" in item && typeof item.type === "string") {
      entry.type = item.type;
    }
    if (Object.keys(entry).length > 0) {
      output.push(entry);
    }
  }

  return output;
}

export function extractTextFromMcpResponse(raw: unknown): string {
  const items = extractMcpContents(raw);
  const texts = items.flatMap((item) => (item.text ? [item.text] : []));
  return texts.join("\n");
}
