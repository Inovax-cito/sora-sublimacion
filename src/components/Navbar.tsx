"use client";

import React from "react";
import Image from "next/image";
import { 
  Tags, 
  ShoppingBag, 
  ShoppingCart, 
  BarChart3, 
  History, 
  Cloud, 
  PlusCircle, 
  Search 
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewArticleModal: () => void;
  totalArticulos: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  onOpenNewArticleModal,
  totalArticulos,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  return (
    <header style={{
      backgroundColor: "#ffffff",
      borderBottom: "1.5px solid var(--border-color)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
    }}>
      {/* Barra superior con Logo y Branding */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0.85rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Identidad de marca Sora */}
        <div 
          onClick={() => setCurrentTab("catalogo")}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.85rem", 
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(122, 17, 34, 0.2)",
            border: "2px solid #7a1122",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fbf7f0"
          }}>
            <Image 
              src="/logo-sora.jpeg" 
              alt="Sora Sublimación Logo" 
              width={48} 
              height={48}
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <div>
            <div style={{ 
              fontFamily: "var(--font-serif)", 
              fontSize: "1.55rem", 
              fontWeight: "800", 
              color: "var(--color-brand-primary)",
              lineHeight: 1.1,
              letterSpacing: "0.5px"
            }}>
              SORA
            </div>
            <div style={{ 
              fontSize: "0.7rem", 
              fontWeight: "700", 
              letterSpacing: "2.5px", 
              color: "var(--color-brand-primary)",
              textTransform: "uppercase"
            }}>
              SUBLIMACIÓN
            </div>
          </div>
        </div>

        {/* Buscador general en tiempo real */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          flex: "1 1 320px", 
          maxWidth: "480px" 
        }}>
          <div style={{ 
            position: "relative", 
            width: "100%",
            display: "flex",
            alignItems: "center"
          }}>
            <Search 
              size={18} 
              style={{ 
                position: "absolute", 
                left: "12px", 
                color: "var(--color-text-muted)",
                pointerEvents: "none"
              }} 
            />
            <input
              type="text"
              placeholder="Buscar artículo por nombre, código o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "2.4rem",
                paddingRight: "1rem",
                borderRadius: "var(--border-radius-full)",
                backgroundColor: "#f9fafb",
                border: "1.5px solid #e5e7eb"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  color: "var(--color-text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Botón de acción rápida: Nuevo Artículo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="badge badge-wine" style={{ padding: "0.4rem 0.8rem" }}>
            {totalArticulos} {totalArticulos === 1 ? "Artículo" : "Artículos"}
          </span>
          <button
            onClick={onOpenNewArticleModal}
            className="btn-primary"
            style={{ fontSize: "0.9rem" }}
          >
            <PlusCircle size={18} />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {/* Navegación por Módulos y Pestañas */}
      <nav style={{
        backgroundColor: "#faf6f0",
        borderTop: "1px solid #f0e6d8",
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto"
        }}>
          <button
            onClick={() => setCurrentTab("catalogo")}
            style={{
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: currentTab === "catalogo" ? "var(--color-brand-primary)" : "var(--color-text-muted)",
              borderBottom: currentTab === "catalogo" ? "3px solid var(--color-brand-primary)" : "3px solid transparent",
              backgroundColor: currentTab === "catalogo" ? "rgba(122, 17, 34, 0.06)" : "transparent",
              borderRadius: "6px 6px 0 0",
              whiteSpace: "nowrap"
            }}
          >
            <Tags size={18} />
            Catálogo & Precios
          </button>

          <button
            onClick={() => setCurrentTab("compras")}
            style={{
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: currentTab === "compras" ? "var(--color-brand-primary)" : "var(--color-text-muted)",
              borderBottom: currentTab === "compras" ? "3px solid var(--color-brand-primary)" : "3px solid transparent",
              backgroundColor: currentTab === "compras" ? "rgba(122, 17, 34, 0.06)" : "transparent",
              borderRadius: "6px 6px 0 0",
              whiteSpace: "nowrap"
            }}
          >
            <ShoppingBag size={18} />
            Control de Compras
          </button>

          <button
            onClick={() => setCurrentTab("ventas")}
            style={{
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: currentTab === "ventas" ? "var(--color-brand-primary)" : "var(--color-text-muted)",
              borderBottom: currentTab === "ventas" ? "3px solid var(--color-brand-primary)" : "3px solid transparent",
              backgroundColor: currentTab === "ventas" ? "rgba(122, 17, 34, 0.06)" : "transparent",
              borderRadius: "6px 6px 0 0",
              whiteSpace: "nowrap"
            }}
          >
            <ShoppingCart size={18} />
            Punto de Ventas
          </button>

          <button
            onClick={() => setCurrentTab("dashboard")}
            style={{
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: currentTab === "dashboard" ? "var(--color-brand-primary)" : "var(--color-text-muted)",
              borderBottom: currentTab === "dashboard" ? "3px solid var(--color-brand-primary)" : "3px solid transparent",
              backgroundColor: currentTab === "dashboard" ? "rgba(122, 17, 34, 0.06)" : "transparent",
              borderRadius: "6px 6px 0 0",
              whiteSpace: "nowrap"
            }}
          >
            <BarChart3 size={18} />
            Dashboard & Balance
          </button>

          <button
            onClick={() => setCurrentTab("historial")}
            style={{
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: currentTab === "historial" ? "var(--color-brand-primary)" : "var(--color-text-muted)",
              borderBottom: currentTab === "historial" ? "3px solid var(--color-brand-primary)" : "3px solid transparent",
              backgroundColor: currentTab === "historial" ? "rgba(122, 17, 34, 0.06)" : "transparent",
              borderRadius: "6px 6px 0 0",
              whiteSpace: "nowrap"
            }}
          >
            <History size={18} />
            Auditoría de Movimientos
          </button>

          <button
            onClick={() => setCurrentTab("cloud")}
            style={{
              padding: "0.75rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: currentTab === "cloud" ? "#0284c7" : "var(--color-text-muted)",
              borderBottom: currentTab === "cloud" ? "3px solid #0284c7" : "3px solid transparent",
              backgroundColor: currentTab === "cloud" ? "rgba(2, 132, 199, 0.08)" : "transparent",
              borderRadius: "6px 6px 0 0",
              whiteSpace: "nowrap"
            }}
          >
            <Cloud size={18} />
            Despliegue a la Nube
          </button>
        </div>
      </nav>
    </header>
  );
}
