"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Articulo, Compra } from "@/types";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  User, 
  FileText, 
  PackageCheck,
  TrendingDown
} from "lucide-react";

interface ComprasManagerProps {
  articulos: Articulo[];
  compras: Compra[];
  onRefreshData: () => Promise<void>;
  preselectedArticle?: Articulo | null;
  onClearPreselected?: () => void;
}

interface ItemCompraForm {
  articuloId: number;
  cantidad: number;
  precioUnit: number;
  actualizarPrecioCompra: boolean;
}

export default function ComprasManager({
  articulos,
  compras,
  onRefreshData,
  preselectedArticle,
  onClearPreselected,
}: ComprasManagerProps) {
  // Estado del formulario de compras
  const [proveedor, setProveedor] = useState("");
  const [comprobante, setComprobante] = useState("");
  const [observacion, setObservacion] = useState("");
  
  // Selector actual para agregar ítems
  const [selectedArticuloId, setSelectedArticuloId] = useState<number>(
    preselectedArticle ? preselectedArticle.id : articulos[0]?.id || 0
  );
  const [inputCantidad, setInputCantidad] = useState<number>(10);
  const [inputPrecioUnit, setInputPrecioUnit] = useState<number>(
    preselectedArticle ? preselectedArticle.precioCompra : articulos[0]?.precioCompra || 0
  );
  const [inputActualizarPrecio, setInputActualizarPrecio] = useState(false);

  // Lista de ítems en la compra actual
  const [itemsCompra, setItemsCompra] = useState<ItemCompraForm[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cuando cambia el artículo seleccionado en el selector, actualizar el precio sugerido
  const handleArticuloChange = (id: number) => {
    setSelectedArticuloId(id);
    const art = articulos.find((a) => a.id === id);
    if (art) {
      setInputPrecioUnit(art.precioCompra);
    }
  };

  // Agregar ítem a la lista de compra
  const handleAddItem = () => {
    if (!selectedArticuloId) {
      setErrorMsg("Debes seleccionar un artículo registrado en el catálogo");
      return;
    }

    // Validación estricta: debe existir en los artículos de la BD
    const art = articulos.find((a) => a.id === selectedArticuloId);
    if (!art) {
      setErrorMsg("El artículo seleccionado no existe en el catálogo");
      return;
    }

    if (inputCantidad <= 0) {
      setErrorMsg("La cantidad debe ser mayor a cero");
      return;
    }

    if (inputPrecioUnit < 0) {
      setErrorMsg("El precio unitario no puede ser negativo");
      return;
    }

    // Si ya está en la lista, actualizar
    const indexExistente = itemsCompra.findIndex((i) => i.articuloId === selectedArticuloId);
    if (indexExistente >= 0) {
      const nuevaLista = [...itemsCompra];
      nuevaLista[indexExistente].cantidad += inputCantidad;
      nuevaLista[indexExistente].precioUnit = inputPrecioUnit;
      nuevaLista[indexExistente].actualizarPrecioCompra = inputActualizarPrecio;
      setItemsCompra(nuevaLista);
    } else {
      setItemsCompra([
        ...itemsCompra,
        {
          articuloId: selectedArticuloId,
          cantidad: inputCantidad,
          precioUnit: inputPrecioUnit,
          actualizarPrecioCompra: inputActualizarPrecio,
        },
      ]);
    }

    setErrorMsg(null);
    setInputCantidad(10);
    if (onClearPreselected) onClearPreselected();
  };

  // Quitar ítem de la lista
  const handleRemoveItem = (index: number) => {
    setItemsCompra(itemsCompra.filter((_, i) => i !== index));
  };

  // Calcular total de la compra
  const totalCompra = itemsCompra.reduce((acc, item) => acc + item.cantidad * item.precioUnit, 0);

  // Enviar compra al servidor
  const handleSubmitCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsCompra.length === 0) {
      setErrorMsg("Debes agregar al menos un artículo a la orden de compra");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        proveedor,
        comprobante,
        observacion,
        detalles: itemsCompra,
      };

      const res = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar la compra");

      setSuccessMsg("¡Compra registrada exitosamente! El stock de los artículos ha sido actualizado.");
      setItemsCompra([]);
      setProveedor("");
      setComprobante("");
      setObservacion("");
      await onRefreshData();

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Encabezado del Módulo */}
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
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-brand-primary)" }}>
              Control de Compras (Entrada de Mercancía)
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Registra compras de proveedores. Solo se pueden registrar artículos existentes en el catálogo; el stock se incrementará automáticamente.
            </p>
          </div>
        </div>

        <span className="badge badge-wine" style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}>
          {compras.length} Compras Registradas
        </span>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: "var(--color-success-bg)",
          color: "var(--color-success)",
          border: "1.5px solid var(--color-success-border)",
          padding: "1rem 1.25rem",
          borderRadius: "var(--border-radius-md)",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          fontWeight: 600
        }}>
          <CheckCircle2 size={22} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          backgroundColor: "var(--color-danger-bg)",
          color: "var(--color-danger)",
          border: "1.5px solid var(--color-danger-border)",
          padding: "1rem 1.25rem",
          borderRadius: "var(--border-radius-md)",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          fontWeight: 600
        }}>
          <AlertCircle size={22} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* FORMULARIO DE REGISTRO DE COMPRA */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--color-brand-primary)" }}>
            Nueva Orden de Compra
          </h2>

          {/* Datos del comprobante */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Proveedor
              </label>
              <input
                type="text"
                placeholder="Ej: Distribuidora Textil Mayorista"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                N° Factura / Remito
              </label>
              <input
                type="text"
                placeholder="Ej: FAC-A-000458"
                value={comprobante}
                onChange={(e) => setComprobante(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* SECCIÓN DE AGREGAR ARTÍCULO EXISTENTE */}
          <div style={{
            backgroundColor: "#faf6f0",
            padding: "1.1rem",
            borderRadius: "var(--border-radius-md)",
            border: "1px solid #f0e6d8",
            marginBottom: "1.25rem"
          }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "0.85rem", color: "var(--color-brand-primary)" }}>
              Seleccionar Artículo del Catálogo (Requisito estricto)
            </h3>

            {articulos.length === 0 ? (
              <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>
                No hay artículos registrados aún en el catálogo. Primero debes crearlos en el apartado "Catálogo & Precios".
              </p>
            ) : (
              <>
                <div style={{ marginBottom: "0.85rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                    Artículo Existente:
                  </label>
                  <select
                    value={selectedArticuloId}
                    onChange={(e) => handleArticuloChange(parseInt(e.target.value, 10))}
                    style={{ width: "100%", fontWeight: 600 }}
                  >
                    {articulos.map((art) => (
                      <option key={art.id} value={art.id}>
                        [{art.codigo}] {art.nombre} - Stock actual: {art.stockActual} u. (Costo base: ${art.precioCompra})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                      Cantidad Comprada:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={inputCantidad}
                      onChange={(e) => setInputCantidad(parseInt(e.target.value, 10) || 1)}
                      style={{ width: "100%", fontWeight: "bold" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                      Precio Unitario de Compra ($):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={inputPrecioUnit}
                      onChange={(e) => setInputPrecioUnit(parseFloat(e.target.value) || 0)}
                      style={{ width: "100%", fontWeight: "bold" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={inputActualizarPrecio}
                      onChange={(e) => setInputActualizarPrecio(e.target.checked)}
                      style={{ accentColor: "var(--color-brand-primary)" }}
                    />
                    <span>Actualizar costo base del artículo en catálogo con este nuevo precio</span>
                  </label>

                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                    Subtotal: ${(inputCantidad * inputPrecioUnit).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Plus size={16} />
                  Agregar Artículo a la Orden
                </button>
              </>
            )}
          </div>

          {/* LISTA DE ÍTEMS AGREGADOS */}
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.6rem" }}>
              Detalle de la Orden ({itemsCompra.length} {itemsCompra.length === 1 ? "ítem" : "ítems"})
            </h3>

            {itemsCompra.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "1.5rem",
                backgroundColor: "#f9fafb",
                borderRadius: "var(--border-radius-sm)",
                color: "var(--color-text-muted)",
                fontSize: "0.88rem"
              }}>
                Aún no has agregado ningún artículo a esta compra.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {itemsCompra.map((item, index) => {
                  const art = articulos.find((a) => a.id === item.articuloId);
                  const subtotal = item.cantidad * item.precioUnit;

                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--border-radius-sm)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "36px", height: "36px", position: "relative", borderRadius: "6px", overflow: "hidden" }}>
                          <Image
                            src={art?.imagenUrl || "/logo-sora.jpeg"}
                            alt={art?.nombre || "Artículo"}
                            fill
                            sizes="36px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{art?.nombre}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                            {item.cantidad} u. x ${item.precioUnit.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            {item.actualizarPrecioCompra && (
                              <span style={{ color: "var(--color-brand-primary)", marginLeft: "6px", fontWeight: 600 }}>
                                (Actualiza costo)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                          ${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          style={{ color: "#dc2626", padding: "0.2rem" }}
                          title="Quitar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              Observaciones o Notas
            </label>
            <input
              type="text"
              placeholder="Ej: Entrega pactada para el viernes, pago contra entrega"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* TOTAL Y CONFIRMACIÓN */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "1rem",
            borderTop: "1.5px solid var(--border-color)"
          }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Total a Pagar:</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-brand-primary)" }}>
                ${totalCompra.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button
              onClick={handleSubmitCompra}
              disabled={submitting || itemsCompra.length === 0}
              className="btn-action-orange"
              style={{
                width: "auto",
                padding: "0.8rem 1.8rem",
                opacity: submitting || itemsCompra.length === 0 ? 0.6 : 1
              }}
            >
              <PackageCheck size={18} />
              <span>{submitting ? "Guardando..." : "Confirmar y Registrar Compra"}</span>
            </button>
          </div>
        </div>

        {/* HISTORIAL DE COMPRAS REGISTRADAS */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--color-brand-primary)" }}>
            Historial de Compras Recientes
          </h2>

          {compras.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
              <FileText size={40} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
              <p>No se han registrado compras aún.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "600px", overflowY: "auto" }}>
              {compras.map((compra) => (
                <div
                  key={compra.id}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "1rem",
                    backgroundColor: "#fcfcfc"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--color-brand-primary)" }}>
                        {compra.proveedor ? `Proveedor: ${compra.proveedor}` : "Compra Directa"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}>
                        <Calendar size={13} />
                        {new Date(compra.fecha).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {compra.comprobante && (
                          <span style={{ marginLeft: "6px", backgroundColor: "#e5e7eb", padding: "1px 6px", borderRadius: "4px" }}>
                            {compra.comprobante}
                          </span>
                        )}
                      </div>
                    </div>

                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-brand-primary)" }}>
                      ${compra.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Detalle de ítems de la compra */}
                  <div style={{ backgroundColor: "#ffffff", borderRadius: "6px", padding: "0.5rem", marginTop: "0.5rem", border: "1px solid #f0f0f0" }}>
                    {compra.detalles.map((det) => (
                      <div
                        key={det.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.82rem",
                          padding: "0.25rem 0",
                          borderBottom: "1px dashed #f0f0f0"
                        }}
                      >
                        <span>
                          <strong>{det.cantidad}x</strong> {det.articulo?.nombre || `Artículo #${det.articuloId}`}
                        </span>
                        <span style={{ fontWeight: 600 }}>
                          ${det.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {compra.observacion && (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem", fontStyle: "italic" }}>
                      Nota: {compra.observacion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
