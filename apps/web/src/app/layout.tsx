import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORCA — Marine Decision & Coastal Intelligence Copilot",
  description: "Autonomous Marine Decision Support & Coastal Intelligence Platform powered by Collaborative AI Agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ocean-950 font-sans text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
