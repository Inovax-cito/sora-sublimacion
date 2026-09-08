"use client";

import React, { useState, useEffect } from "react";
import { Target, TrendingUp, Edit2, Check, X, Sparkles, Trophy } from "lucide-react";

interface GoalProgressBarProps {
  totalVentas: number;
  onGoalUpdated?: () => void;
}

export default function GoalProgressBar({ totalVentas, onGoalUpdated }: GoalProgressBarProps) {
  const [meta, setMeta] = useState<number>(1000000);
  const [isEditing, setIsEditing] = useState(false);
  const [inputMeta, setInputMeta] = useState<string>("1000000");
  const [saving, setSaving] = useState(false);

  // Cargar meta desde API
  useEffect(() => {
    fetch("/api/meta")
      .then((res) => res.json())
      .then((data) => {
        if (data.meta) {
          setMeta(data.meta);
          setInputMeta(data.meta.toString());
        }
      })
      .catch((err) => console.error("Error al cargar meta:", err));
  }, []);

  const handleSaveMeta = async () => {
    const num = parseFloat(inputMeta);
    if (isNaN(num) || num <= 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta: num }),
      });
      const data = await res.json();
      if (data.meta) {
        setMeta(data.meta);
        setIsEditing(false);
        if (onGoalUpdated) onGoalUpdated();
      }
    } catch (err) {
      console.error("Error al guardar meta:", err);
    } finally {
      setSaving(false);
    }
  };

  const porcentaje = meta > 0 ? Math.min(100, Math.max(0, (totalVentas / meta) * 100)) : 0;
  const faltante = Math.max(0, meta - totalVentas);
  const metaAlcanzada = totalVentas >= meta;

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderBottom: "1.5px solid #f0e6d8",
      background: "linear-gradient(180deg, #ffffff 0%, #faf6f0 100%)",
      padding: "0.85rem 1.5rem",
      boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }}>
        {/* Fila Superior: Título, Meta y Estado */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              backgroundColor: metaAlcanzada ? "var(--color-success-bg)" : "var(--color-brand-light)",
              color: metaAlcanzada ? "var(--color-success)" : "var(--color-brand-primary)",
              padding: "0.4rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center"
            }}>
              {metaAlcanzada ? <Trophy size={18} /> : <Target size={18} />}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--color-brand-primary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Barra de Objetivo de Ventas (Goal):
                </span>
                {metaAlcanzada && (
                  <span className="badge badge-green" style={{ fontSize: "0.68rem" }}>
                    ¡Meta Lograda! 🎉
                  </span>
                )}
              </div>

              <div style={{ fontSize: "0.9rem", color: "var(--color-text-main)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>Recaudado: <strong>${totalVentas.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</strong></span>
                <span style={{ color: "var(--color-text-muted)" }}>/</span>
                <span>Meta Propuesta:</span>

                {isEditing ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ fontWeight: 700 }}>$</span>
                    <input
                      type="number"
                      value={inputMeta}
                      onChange={(e) => setInputMeta(e.target.value)}
                      style={{
                        padding: "0.2rem 0.5rem",
                        fontSize: "0.85rem",
                        width: "120px",
                        borderRadius: "4px",
                        border: "1.5px solid var(--color-brand-primary)"
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveMeta}
                      disabled={saving}
                      style={{
                        backgroundColor: "var(--color-brand-primary)",
                        color: "#fff",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        backgroundColor: "#e5e7eb",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <strong style={{ color: "var(--color-brand-primary)", fontSize: "1rem" }}>
                      ${meta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </strong>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        color: "var(--color-text-muted)",
                        padding: "0.2rem",
                        display: "flex",
                        alignItems: "center"
                      }}
                      title="Modificar meta propuesta a ganar"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: metaAlcanzada ? "var(--color-success)" : "var(--color-brand-primary)" }}>
                {porcentaje.toFixed(1)}%
              </span>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                {metaAlcanzada
                  ? "¡Superaste el objetivo fijado!"
                  : `Faltan $${faltante.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Progreso Visual */}
        <div style={{
          width: "100%",
          height: "12px",
          backgroundColor: "#e5e7eb",
          borderRadius: "var(--border-radius-full)",
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            height: "100%",
            width: `${porcentaje}%`,
            background: metaAlcanzada
              ? "linear-gradient(90deg, #15803d 0%, #22c55e 100%)"
              : "linear-gradient(90deg, #7a1122 0%, #f97316 60%, #15803d 100%)",
            borderRadius: "var(--border-radius-full)",
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: "0 0 10px rgba(122, 17, 34, 0.4)"
          }} />
        </div>
      </div>
    </div>
  );
}
