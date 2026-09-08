"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { DashboardSummary, Articulo } from "@/types";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  ShoppingBag, 
  ShoppingCart, 
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from "lucide-react";

interface DashboardStatsProps {
  onNavigateToBuy?: (art: Articulo) => void;
}

export default function DashboardStats({ onNavigateToBuy }: DashboardStatsProps) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>Calculando balance y finanzas en tiempo real...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Banner de Bienvenida y Resumen Ejecutivo */}
      <div style={{
        backgroundColor: "var(--color-brand-primary)",
        color: "#ffffff",
        borderRadius: "var(--border-radius-lg)",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "var(--shadow-lg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Sparkles size={20} style={{ color: "#fde047" }} />
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.9 }}>
              Panel de Control Financiero
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Sora Sublimación - Balance Operativo
          </h1>
          <p style={{ opacity: 0.85, fontSize: "0.95rem", maxWidth: "600px" }}>
            Visión global del flujo de caja, valorización del stock almacenado y rentabilidad de artículos.
          </p>
        </div>

        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(10px)",
          padding: "1.25rem 1.75rem",
          borderRadius: "var(--border-radius-md)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          textAlign: "right"
        }}>
          <div style={{ fontSize: "0.8rem", textTransform: "uppercase", opacity: 0.85 }}>Balance Neto del Negocio</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            ${data.balanceNeto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "0.2rem" }}>
            (Total Ventas - Total Compras)
          </div>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS PRINCIPALES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem"
      }}>
        {/* Total Ventas */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.4rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-muted)" }}>INGRESOS POR VENTAS</span>
            <div style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", padding: "0.4rem", borderRadius: "8px" }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-success)", marginBottom: "0.3rem" }}>
            ${data.totalVentasMonetario.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            {data.cantidadVentas} comprobantes emitidos
          </div>
        </div>

        {/* Total Compras */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.4rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-muted)" }}>EGRESOS POR COMPRAS</span>
            <div style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "0.4rem", borderRadius: "8px" }}>
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-danger)", marginBottom: "0.3rem" }}>
            ${data.totalComprasMonetario.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            {data.cantidadCompras} órdenes de compra realizadas
          </div>
        </div>

        {/* Valor de Inventario al Costo */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.4rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-muted)" }}>INVENTARIO EN DEPÓSITO</span>
            <div style={{ backgroundColor: "var(--color-brand-light)", color: "var(--color-brand-primary)", padding: "0.4rem", borderRadius: "8px" }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-brand-primary)", marginBottom: "0.3rem" }}>
            ${data.valorInventarioCosto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            Valuado a precio de compra ({data.cantidadArticulos} artículos)
          </div>
        </div>

        {/* Ganancia Potencial del Inventario */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.4rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-muted)" }}>GANANCIA PROYECTADA</span>
            <div style={{ backgroundColor: "#fef3c7", color: "#d97706", padding: "0.4rem", borderRadius: "8px" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#d97706", marginBottom: "0.3rem" }}>
            +${data.gananciaPotencialInventario.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            Si vendes el 100% del stock actual
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Alertas de Stock y Últimas Transacciones */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Alertas de Stock Bajo */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <AlertTriangle size={22} style={{ color: "#dc2626" }} />
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-brand-primary)" }}>
              Alertas de Stock Bajo ({data.articulosBajoStock.length})
            </h2>
          </div>

          {data.articulosBajoStock.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "2rem",
              backgroundColor: "var(--color-success-bg)",
              borderRadius: "var(--border-radius-md)",
              color: "var(--color-success)",
              fontWeight: 600
            }}>
              ¡Excelente! Todos los artículos cuentan con stock por encima del mínimo.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data.articulosBajoStock.map((art) => (
                <div
                  key={art.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#fef2f2",
                    borderRadius: "var(--border-radius-sm)",
                    border: "1px solid #fecaca"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{art.nombre}</div>
                    <div style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600 }}>
                      Quedan {art.stockActual} unidades (Mínimo sugerido: {art.stockMinimo})
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToBuy && onNavigateToBuy(art)}
                    className="btn-primary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    Reponer Stock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas Ventas Realizadas */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--color-brand-primary)" }}>
            Últimas Ventas Emitidas
          </h2>

          {data.ultimasVentas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
              No hay ventas registradas aún.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data.ultimasVentas.map((venta) => (
                <div
                  key={venta.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#fcfcfc",
                    borderRadius: "var(--border-radius-sm)",
                    border: "1px solid var(--border-color)"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                      Ticket {venta.numeroTicket} • {venta.cliente}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {new Date(venta.fecha).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} • {venta.metodoPago}
                    </div>
                  </div>

                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--color-brand-primary)" }}>
                    ${venta.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
