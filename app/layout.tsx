import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "MCP Host",
  description: "Minimal MCP host for hello_world and UI resource tests.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
