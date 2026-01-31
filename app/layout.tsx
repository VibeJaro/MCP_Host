import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Host",
  description: "Minimal MCP Host for chat + MCP apps"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <header>
            <h1>MCP Host</h1>
            <p className="helper">
              Minimaler Host für Chat und MCP-Apps (hello_world Test)
            </p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
