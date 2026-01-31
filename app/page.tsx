import HostPanel from "@/app/components/HostPanel";

function maskServerUrl(value: string | undefined): string {
  if (!value) {
    return "not set";
  }

  if (value.length <= 6) {
    return "***";
  }

  const start = value.slice(0, 6);
  const end = value.slice(-4);
  return `${start}...${end}`;
}

export default function Page() {
  const serverUrl = process.env.MCP_SERVER_URL;
  const masked = maskServerUrl(serverUrl);

  return <HostPanel serverUrlMasked={masked} />;
}
