"use client";

import React, { useState } from "react";
import { Compra, Venta } from "@/types";
import { History, ShoppingCart, ShoppingBag, Calendar, Search, FileText } from "lucide-react";

interface HistorialManagerProps {
  compras: Compra[];
  ventas: Venta[];
}

export default function HistorialManager({ compras, ventas }: HistorialManagerProps) {
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "ventas" | "compras">("todos");
  const [busqueda, setBusqueda] = useState("");

  // Unificar movimientos ordenados cronológicamente descendente
  const movimientos = [
    ...ventas.map((v) => ({
      id: `v-${v.id}`,
      tipo: "VENTA" as const,
      fecha: new Date(v.fecha),
      identificador: v.numeroTicket || `Venta #${v.id}`,
      tercero: v.cliente || "Consumidor Final",
      total: v.total,
      detalles: v.detalles.map((d) => ({
        cantidad: d.cantidad,
        nombre: d.articulo?.nombre || `Artículo #${d.articuloId}`,
        precioUnit: d.precioUnit,
        subtotal: d.subtotal,
      })),
      infoAdicional: v.metodoPago,
    })),
    ...compras.map((c) => ({
      id: `c-${c.id}`,
      tipo: "COMPRA" as const,
      fecha: new Date(c.fecha),
      identificador: c.comprobante || `Compra #${c.id}`,
      tercero: c.proveedor || "Proveedor",
      total: c.total,
      detalles: c.detalles.map((d) => ({
        cantidad: d.cantidad,
        nombre: d.articulo?.nombre || `Artículo #${d.articuloId}`,
        precioUnit: d.precioUnit,
        subtotal: d.subtotal,
      })),
      infoAdicional: c.observacion,
    })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const movimientosFiltrados = movimientos.filter((m) => {
    const matchTipo =
      filtroTipo === "todos" ||
      (filtroTipo === "ventas" && m.tipo === "VENTA") ||
      (filtroTipo === "compras" && m.tipo === "COMPRA");

    const matchBusqueda =
      m.identificador.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.tercero.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.detalles.some((d) => d.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    return matchTipo && matchBusqueda;
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{
        marginBottom: "1.5rem",
        backgroundColor: "#ffffff",
        padding: "1.25rem 1.5rem",
        borderRadius: "var(--border-radius-md)",
        border: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{
            backgroundColor: "var(--color-brand-light)",
            color: "var(--color-brand-primary)",
            padding: "0.75rem",
            borderRadius: "var(--border-radius-md)"
          }}>
            <History size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-brand-primary)" }}>
              Auditoría General de Movimientos
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Registro cronológico inmutable de todas las compras y ventas efectuadas.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", backgroundColor: "#f3f4f6", borderRadius: "var(--border-radius-full)", padding: "3px" }}>
            <button
              onClick={() => setFiltroTipo("todos")}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "var(--border-radius-full)",
                fontSize: "0.8rem",
                fontWeight: 600,
                backgroundColor: filtroTipo === "todos" ? "var(--color-brand-primary)" : "transparent",
                color: filtroTipo === "todos" ? "#ffffff" : "var(--color-text-muted)",
              }}
            >
              Todos ({movimientos.length})
            </button>
            <button
              onClick={() => setFiltroTipo("ventas")}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "var(--border-radius-full)",
                fontSize: "0.8rem",
                fontWeight: 600,
                backgroundColor: filtroTipo === "ventas" ? "var(--color-success)" : "transparent",
                color: filtroTipo === "ventas" ? "#ffffff" : "var(--color-text-muted)",
              }}
            >
              Ventas ({ventas.length})
            </button>
            <button
              onClick={() => setFiltroTipo("compras")}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "var(--border-radius-full)",
                fontSize: "0.8rem",
                fontWeight: 600,
                backgroundColor: filtroTipo === "compras" ? "var(--color-danger)" : "transparent",
                color: filtroTipo === "compras" ? "#ffffff" : "var(--color-text-muted)",
              }}
            >
              Compras ({compras.length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Movimientos */}
      {movimientosFiltrados.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)"
        }}>
          <FileText size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
          <p style={{ color: "var(--color-text-muted)" }}>No se registraron movimientos bajo los filtros seleccionados.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {movimientosFiltrados.map((mov) => {
            const esVenta = mov.tipo === "VENTA";

            return (
              <div
                key={mov.id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "var(--border-radius-md)",
                  border: "1px solid var(--border-color)",
                  padding: "1.25rem",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      backgroundColor: esVenta ? "var(--color-success-bg)" : "var(--color-danger-bg)",
                      color: esVenta ? "var(--color-success)" : "var(--color-danger)",
                      padding: "0.5rem",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {esVenta ? <ShoppingCart size={20} /> : <ShoppingBag size={20} />}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 800, fontSize: "1rem" }}>{mov.identificador}</span>
                        <span className={`badge ${esVenta ? "badge-green" : "badge-red"}`}>
                          {mov.tipo}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                        <Calendar size={13} />
                        {mov.fecha.toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <span>•</span>
                        <span>{mov.tercero}</span>
                        {mov.infoAdicional && <span>• ({mov.infoAdicional})</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Total Movimiento</div>
                    <div style={{
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      color: esVenta ? "var(--color-success)" : "var(--color-danger)"
                    }}>
                      {esVenta ? "+" : "-"}${mov.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Desglose de Ítems */}
                <div style={{
                  backgroundColor: "#fafafa",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--border-radius-sm)",
                  border: "1px solid #f0f0f0"
                }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                    Artículos en esta transacción ({mov.detalles.length}):
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.5rem" }}>
                    {mov.detalles.map((det, i) => (
                      <div key={i} style={{ fontSize: "0.83rem", display: "flex", justifyContent: "space-between", padding: "0.25rem 0.5rem", backgroundColor: "#ffffff", borderRadius: "4px", border: "1px solid #eee" }}>
                        <span><strong>{det.cantidad}x</strong> {det.nombre}</span>
                        <span style={{ fontWeight: 600 }}>${det.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
