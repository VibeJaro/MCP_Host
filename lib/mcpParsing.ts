export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type McpContentItem = {
  uri?: string;
  mimeType?: string;
  text?: string;
  blob?: string;
};

function extractContentItems(raw: unknown): McpContentItem[] {
  if (!isRecord(raw)) {
    return [];
  }

  const resultValue = "result" in raw ? raw.result : undefined;
  if (!isRecord(resultValue)) {
    return [];
  }

  const contentValue = "content" in resultValue ? resultValue.content : undefined;
  const contentsValue = "contents" in resultValue ? resultValue.contents : undefined;

  const items = Array.isArray(contentValue)
    ? contentValue
    : Array.isArray(contentsValue)
      ? contentsValue
      : [];

  return items.filter(isRecord).map((item) => ({
    uri: typeof item.uri === "string" ? item.uri : undefined,
    mimeType: typeof item.mimeType === "string" ? item.mimeType : undefined,
    text: typeof item.text === "string" ? item.text : undefined,
    blob: typeof item.blob === "string" ? item.blob : undefined
  }));
}

export function extractTextFromMcpResponse(raw: unknown): string {
  const items = extractContentItems(raw);
  const texts = items.map((item) => item.text).filter((text): text is string => !!text);
  return texts.join("\n");
}

export function extractHtmlFromMcpResponse(
  raw: unknown
): { html: string; mimeType?: string; uri?: string } {
  const items = extractContentItems(raw);
  const htmlItem = items.find(
    (item) => item.text && item.mimeType?.toLowerCase().includes("text/html")
  );

  if (htmlItem?.text) {
    return { html: htmlItem.text, mimeType: htmlItem.mimeType, uri: htmlItem.uri };
  }

  const text = items.map((item) => item.text).filter((item): item is string => !!item).join("\n");
  const firstItem = items[0];
  return {
    html: text,
    mimeType: firstItem?.mimeType,
    uri: firstItem?.uri
  };
}
