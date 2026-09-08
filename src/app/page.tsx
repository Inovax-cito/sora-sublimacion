"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import GoalProgressBar from "@/components/GoalProgressBar";
import ArticulosManager from "@/components/ArticulosManager";
import ComprasManager from "@/components/ComprasManager";
import VentasManager from "@/components/VentasManager";
import DashboardStats from "@/components/DashboardStats";
import HistorialManager from "@/components/HistorialManager";
import { Articulo, Compra, Venta } from "@/types";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>("catalogo");
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados transversales
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [preselectedArticle, setPreselectedArticle] = useState<Articulo | null>(null);

  // Carga sincronizada de datos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resArt, resComp, resVent] = await Promise.all([
        fetch("/api/articulos"),
        fetch("/api/compras"),
        fetch("/api/ventas"),
      ]);

      if (resArt.ok) {
        const dataArt = await resArt.json();
        setArticulos(dataArt);
      }
      if (resComp.ok) {
        const dataComp = await resComp.json();
        setCompras(dataComp);
      }
      if (resVent.ok) {
        const dataVent = await resVent.json();
        setVentas(dataVent);
      }
    } catch (error) {
      console.error("Error al sincronizar datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Acciones rápidas entre módulos
  const handleQuickSell = (articulo: Articulo) => {
    setPreselectedArticle(articulo);
    setCurrentTab("ventas");
  };

  const handleQuickBuy = (articulo: Articulo) => {
    setPreselectedArticle(articulo);
    setCurrentTab("compras");
  };

  // Total de ventas acumulado para la barra de Goal
  const totalVentasAcumuladas = ventas.reduce((acc, v) => acc + Number(v.total), 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Barra de Navegación con Branding Sora */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewArticleModal={() => setIsArticleModalOpen(true)}
        totalArticulos={articulos.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* BARRA DE OBJETIVO FINANCIERO (GOAL BAR) */}
      <GoalProgressBar
        totalVentas={totalVentasAcumuladas}
        onGoalUpdated={fetchData}
      />

      {/* Contenedor Principal de la Pestaña Activa */}
      <main style={{ flex: 1, paddingBottom: "3rem" }}>
        {currentTab === "catalogo" && (
          <ArticulosManager
            articulos={articulos}
            loading={loading}
            onRefresh={fetchData}
            isModalOpen={isArticleModalOpen}
            setIsModalOpen={setIsArticleModalOpen}
            searchQuery={searchQuery}
            onQuickSell={handleQuickSell}
            onQuickBuy={handleQuickBuy}
          />
        )}

        {currentTab === "compras" && (
          <ComprasManager
            articulos={articulos}
            compras={compras}
            onRefreshData={fetchData}
            preselectedArticle={preselectedArticle}
            onClearPreselected={() => setPreselectedArticle(null)}
          />
        )}

        {currentTab === "ventas" && (
          <VentasManager
            articulos={articulos}
            ventas={ventas}
            onRefreshData={fetchData}
            preselectedArticle={preselectedArticle}
            onClearPreselected={() => setPreselectedArticle(null)}
          />
        )}

        {currentTab === "dashboard" && (
          <DashboardStats onNavigateToBuy={handleQuickBuy} />
        )}

        {currentTab === "historial" && (
          <HistorialManager compras={compras} ventas={ventas} />
        )}
      </main>

      {/* Pie de página limpio y profesional sin detalles técnicos */}
      <footer style={{
        backgroundColor: "#ffffff",
        borderTop: "1.5px solid var(--border-color)",
        padding: "1.5rem",
        textAlign: "center",
        fontSize: "0.85rem",
        color: "var(--color-text-muted)"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <strong style={{ color: "var(--color-brand-primary)" }}>Sora Sublimación</strong> • Sistema de Gestión de Precios, Combos y Ventas
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#15803d", display: "inline-block" }}></span>
            <span>Sistema Operativo en Línea • Todos los derechos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
