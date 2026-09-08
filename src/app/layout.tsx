import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sora Sublimación | Sistema de Control de Precios, Compras y Ventas",
  description: "Plataforma integral de gestión de precios, control estricto de inventario, compras y ventas para Sora Sublimación.",
  icons: {
    icon: "/logo-sora.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
