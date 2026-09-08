"use client";

import React, { useState } from "react";
import { Cloud, Server, Globe, Database, ArrowRight, CheckCircle, Copy, ShieldCheck } from "lucide-react";

export default function CloudDatabaseGuide() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Encabezado */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "1.75rem",
        borderRadius: "var(--border-radius-lg)",
        border: "1px solid var(--border-color)",
        marginBottom: "2rem",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.5rem" }}>
          <div style={{
            backgroundColor: "rgba(2, 132, 199, 0.1)",
            color: "#0284c7",
            padding: "0.75rem",
            borderRadius: "var(--border-radius-md)"
          }}>
            <Cloud size={28} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--color-brand-primary)" }}>
              Guía de Despliegue en la Nube
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              Aprende cómo migrar tu base de datos MySQL local a la nube para que cualquier persona con un enlace público pueda usar el sistema desde cualquier lugar.
            </p>
          </div>
        </div>
      </div>

      {/* 3 PASOS DE ARQUITECTURA CLOUD */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* PASO 1: Base de Datos en la Nube */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.75rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1.5px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "var(--color-brand-primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1rem"
            }}>
              1
            </span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Crear tu Base de Datos MySQL Gratuita en la Nube
            </h2>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Para que la aplicación no dependa de tener tu computadora prendida con <code>localhost:3306</code>, necesitamos un servidor de base de datos MySQL alojado en internet con alta disponibilidad y copias de seguridad.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ padding: "1.25rem", borderRadius: "var(--border-radius-md)", border: "1.5px solid #e0f2fe", backgroundColor: "#f0f9ff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Server size={20} style={{ color: "#0284c7" }} />
                <strong style={{ color: "#0369a1", fontSize: "1rem" }}>Opción A: Railway.app (Recomendada)</strong>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#334155", marginBottom: "0.75rem" }}>
                Permite crear una base de datos MySQL lista para producción en 30 segundos sin tarjetas de crédito iniciales.
              </p>
              <ol style={{ fontSize: "0.82rem", color: "#475569", paddingLeft: "1.2rem", lineHeight: 1.6 }}>
                <li>Ingresa a <a href="https://railway.app" target="_blank" rel="noreferrer" style={{ color: "#0284c7", fontWeight: 700 }}>railway.app</a> y regístrate con GitHub.</li>
                <li>Haz clic en <strong>"New Project"</strong> → <strong>"Provision MySQL"</strong>.</li>
                <li>En la pestaña <strong>"Connect"</strong>, copia la variable <code>DATABASE_URL</code>.</li>
              </ol>
            </div>

            <div style={{ padding: "1.25rem", borderRadius: "var(--border-radius-md)", border: "1.5px solid #fef3c7", backgroundColor: "#fffbeb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Database size={20} style={{ color: "#d97706" }} />
                <strong style={{ color: "#b45309", fontSize: "1rem" }}>Opción B: Aiven for MySQL</strong>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#78350f", marginBottom: "0.75rem" }}>
                Ofrece un plan 100% gratuito de por vida (Free Tier) administrado para bases de datos MySQL dedicadas.
              </p>
              <ol style={{ fontSize: "0.82rem", color: "#78350f", paddingLeft: "1.2rem", lineHeight: 1.6 }}>
                <li>Ingresa a <a href="https://aiven.io" target="_blank" rel="noreferrer" style={{ color: "#d97706", fontWeight: 700 }}>aiven.io</a> y crea tu cuenta gratuita.</li>
                <li>Crea un servicio seleccionando <strong>MySQL (Free Plan)</strong>.</li>
                <li>Copia el <strong>Service URI</strong> con usuario y contraseña provistos.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* PASO 2: Sincronizar con Prisma */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.75rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1.5px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "var(--color-brand-primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1rem"
            }}>
              2
            </span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Sincronizar las Tablas con Prisma ORM
            </h2>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
            Una de las enormes ventajas de usar <strong>Prisma ORM</strong> en este proyecto es que <strong>no necesitas exportar ni importar archivos .sql manualmente</strong>. Solo colocas la nueva URL y ejecutas un comando para que todas las tablas y relaciones se construyan al instante.
          </p>

          <div style={{
            backgroundColor: "#1e293b",
            color: "#f8fafc",
            padding: "1rem 1.25rem",
            borderRadius: "var(--border-radius-md)",
            fontFamily: "monospace",
            fontSize: "0.88rem",
            marginBottom: "1rem",
            position: "relative"
          }}>
            <div style={{ color: "#94a3b8", marginBottom: "0.5rem" }}># 1. En tu archivo .env pega la URL de la nube:</div>
            <div style={{ color: "#38bdf8" }}>DATABASE_URL="mysql://usuario:password@host-remoto.com:3306/sora_db"</div>
            <div style={{ color: "#94a3b8", margin: "0.75rem 0 0.5rem" }}># 2. Ejecuta en tu terminal para crear las tablas en la nube:</div>
            <div style={{ color: "#4ade80" }}>npx prisma db push</div>
            <div style={{ color: "#94a3b8", margin: "0.75rem 0 0.5rem" }}># 3. (Opcional) Si quieres poblar los artículos de ejemplo de Sora:</div>
            <div style={{ color: "#facc15" }}>npx tsx prisma/seed.ts</div>
          </div>
        </div>

        {/* PASO 3: Publicar la Web con Enlace Público */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.75rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1.5px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "var(--color-brand-primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1rem"
            }}>
              3
            </span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Desplegar la Web en Vercel (Enlace Público Gratis y Rápido)
            </h2>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Como la aplicación está desarrollada en <strong>Next.js</strong>, el despliegue oficial y óptimo se realiza en <strong>Vercel</strong> con certificado SSL (HTTPS) automático y CDN mundial.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <CheckCircle size={18} style={{ color: "var(--color-success)", marginTop: "2px", flexShrink: 0 }} />
              <div style={{ fontSize: "0.88rem" }}>
                <strong>Sube este proyecto a tu GitHub:</strong> Inicializa git (<code>git init && git commit -m "Sora Sublimación"</code>) y súbelo a un repositorio personal en GitHub.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <CheckCircle size={18} style={{ color: "var(--color-success)", marginTop: "2px", flexShrink: 0 }} />
              <div style={{ fontSize: "0.88rem" }}>
                <strong>Conecta con Vercel:</strong> Ve a <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ color: "var(--color-brand-primary)", fontWeight: 700 }}>vercel.com</a>, inicia sesión con GitHub y haz clic en <strong>"Add New Project"</strong> seleccionando este repositorio.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <CheckCircle size={18} style={{ color: "var(--color-success)", marginTop: "2px", flexShrink: 0 }} />
              <div style={{ fontSize: "0.88rem" }}>
                <strong>Configura la variable de entorno:</strong> En la sección <em>Environment Variables</em> de Vercel, agrega el nombre <code>DATABASE_URL</code> con el valor de tu base de datos de Railway o Aiven.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <CheckCircle size={18} style={{ color: "var(--color-success)", marginTop: "2px", flexShrink: 0 }} />
              <div style={{ fontSize: "0.88rem" }}>
                <strong>Haz clic en "Deploy":</strong> En menos de 60 segundos obtendrás un enlace como <code>https://sora-sublimacion.vercel.app</code> que podrás compartir con clientes, empleados o socios para que lo usen desde cualquier celular o computadora.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
