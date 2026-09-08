"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Articulo, Venta } from "@/types";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Receipt, 
  CreditCard, 
  DollarSign, 
  Calendar,
  UserCheck
} from "lucide-react";

interface VentasManagerProps {
  articulos: Articulo[];
  ventas: Venta[];
  onRefreshData: () => Promise<void>;
  preselectedArticle?: Articulo | null;
  onClearPreselected?: () => void;
}

interface ItemCarrito {
  articulo: Articulo;
  cantidad: number;
  precioUnit: number;
}

export default function VentasManager({
  articulos,
  ventas,
  onRefreshData,
  preselectedArticle,
  onClearPreselected,
}: VentasManagerProps) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [cliente, setCliente] = useState("Consumidor Final");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [observacion, setObservacion] = useState("");

  const [selectedArticuloId, setSelectedArticuloId] = useState<number>(
    preselectedArticle ? preselectedArticle.id : articulos[0]?.id || 0
  );
  const [inputCantidad, setInputCantidad] = useState<number>(1);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticketEmitido, setTicketEmitido] = useState<Venta | null>(null);

  // Agregar al carrito
  const handleAddToCart = (articulo?: Articulo, qty: number = 1) => {
    const art = articulo || articulos.find((a) => a.id === selectedArticuloId);
    if (!art) {
      setErrorMsg("El artículo seleccionado no existe en el catálogo");
      return;
    }

    if (art.stockActual <= 0) {
      setErrorMsg(`No hay stock disponible para "${art.nombre}" (Stock: 0)`);
      return;
    }

    const itemExistente = carrito.find((item) => item.articulo.id === art.id);
    const cantidadActualEnCarrito = itemExistente ? itemExistente.cantidad : 0;
    const nuevaCantidad = cantidadActualEnCarrito + qty;

    if (nuevaCantidad > art.stockActual) {
      setErrorMsg(
        `Stock insuficiente para "${art.nombre}". Disponibles: ${art.stockActual} u. Ya tienes ${cantidadActualEnCarrito} u. en el carrito.`
      );
      return;
    }

    if (itemExistente) {
      setCarrito(
        carrito.map((item) =>
          item.articulo.id === art.id ? { ...item, cantidad: nuevaCantidad } : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          articulo: art,
          cantidad: qty,
          precioUnit: art.precioVenta,
        },
      ]);
    }

    setErrorMsg(null);
    setInputCantidad(1);
    if (onClearPreselected) onClearPreselected();
  };

  // Modificar cantidad en carrito
  const handleUpdateQuantity = (articuloId: number, delta: number) => {
    const item = carrito.find((i) => i.articulo.id === articuloId);
    if (!item) return;

    const nuevaCant = item.cantidad + delta;
    if (nuevaCant <= 0) {
      handleRemoveFromCart(articuloId);
      return;
    }

    if (nuevaCant > item.articulo.stockActual) {
      setErrorMsg(`Solo hay ${item.articulo.stockActual} unidades disponibles de "${item.articulo.nombre}"`);
      return;
    }

    setErrorMsg(null);
    setCarrito(
      carrito.map((i) =>
        i.articulo.id === articuloId ? { ...i, cantidad: nuevaCant } : i
      )
    );
  };

  const handleRemoveFromCart = (articuloId: number) => {
    setCarrito(carrito.filter((i) => i.articulo.id !== articuloId));
  };

  const totalVenta = carrito.reduce((acc, item) => acc + item.cantidad * item.precioUnit, 0);

  // Confirmar venta
  const handleProcesarVenta = async () => {
    if (carrito.length === 0) {
      setErrorMsg("El carrito de ventas está vacío");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        cliente,
        metodoPago,
        observacion,
        detalles: carrito.map((i) => ({
          articuloId: i.articulo.id,
          cantidad: i.cantidad,
          precioUnit: i.precioUnit,
        })),
      };

      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar la venta");

      setTicketEmitido(data.venta);
      setCarrito([]);
      setCliente("Consumidor Final");
      setObservacion("");
      await onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImprimirTicket = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Encabezado */}
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
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-brand-primary)" }}>
              Punto de Ventas & Facturación
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Venta de artículos con validación de existencia y deducción atómica de inventario.
            </p>
          </div>
        </div>

        <span className="badge badge-wine" style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}>
          {ventas.length} Ventas Procesadas
        </span>
      </div>

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

      {/* MODAL TICKET / COMPROBANTE EMITIDO */}
      {ticketEmitido && (
        <div className="modal-backdrop" onClick={() => setTicketEmitido(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px", padding: "2rem", backgroundColor: "#ffffff" }}
          >
            <div style={{ textAlign: "center", borderBottom: "2px dashed #e5e7eb", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "50px", height: "50px", margin: "0 auto 0.5rem", position: "relative", borderRadius: "50%", overflow: "hidden", border: "2px solid #7a1122" }}>
                <Image src="/logo-sora.jpeg" alt="Sora" fill sizes="50px" style={{ objectFit: "cover" }} />
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-brand-primary)", letterSpacing: "1px" }}>
                SORA SUBLIMACIÓN
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>Comprobante de Venta</p>
              <div style={{ marginTop: "0.5rem", fontWeight: 700, fontSize: "0.9rem" }}>
                Ticket: {ticketEmitido.numeroTicket}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {new Date(ticketEmitido.fecha).toLocaleString("es-AR")}
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem", fontSize: "0.85rem" }}>
              <div><strong>Cliente:</strong> {ticketEmitido.cliente}</div>
              <div><strong>Método de Pago:</strong> {ticketEmitido.metodoPago}</div>
            </div>

            {/* Desglose de ítems */}
            <div style={{ borderBottom: "2px dashed #e5e7eb", paddingBottom: "1rem", marginBottom: "1rem" }}>
              {ticketEmitido.detalles.map((det) => (
                <div key={det.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                  <span>{det.cantidad}x {det.articulo?.nombre || `Artículo #${det.articuloId}`}</span>
                  <span style={{ fontWeight: 700 }}>${det.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>TOTAL COBRADO:</span>
              <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-brand-primary)" }}>
                ${ticketEmitido.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleImprimirTicket}
                className="btn-outline"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Printer size={16} />
                Imprimir Ticket
              </button>
              <button
                onClick={() => setTicketEmitido(null)}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT PRINCIPAL DE VENTAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* CATÁLOGO RÁPIDO PARA SELECCIONAR */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-brand-primary)" }}>
            Catálogo de Productos para la Venta
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", maxHeight: "650px", overflowY: "auto", padding: "0.25rem" }}>
            {articulos.map((art) => {
              const sinStock = art.stockActual <= 0;
              return (
                <div
                  key={art.id}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: sinStock ? "#f9fafb" : "#ffffff",
                    opacity: sinStock ? 0.6 : 1,
                    transition: "transform 0.15s ease",
                  }}
                >
                  <div style={{ width: "100%", height: "110px", position: "relative", borderRadius: "8px", overflow: "hidden", marginBottom: "0.5rem" }}>
                    <Image
                      src={art.imagenUrl || "/logo-sora.jpeg"}
                      alt={art.nombre}
                      fill
                      sizes="180px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--color-brand-primary)", lineHeight: 1.2, marginBottom: "0.3rem", minHeight: "2.1rem" }}>
                    {art.nombre}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 800 }}>
                      ${art.precioVenta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`badge ${sinStock ? "badge-red" : "badge-green"}`} style={{ fontSize: "0.68rem" }}>
                      {art.stockActual} u.
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(art, 1)}
                    disabled={sinStock}
                    className="btn-action-orange"
                    style={{
                      padding: "0.45rem",
                      fontSize: "0.78rem",
                      marginTop: "auto",
                      opacity: sinStock ? 0.5 : 1,
                      cursor: sinStock ? "not-allowed" : "pointer"
                    }}
                  >
                    <Plus size={14} />
                    {sinStock ? "Agotado" : "Agregar"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARRITO Y COBRO DE VENTA */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "var(--border-radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-brand-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShoppingCart size={20} />
              Carrito de Venta ({carrito.length})
            </h2>
            {carrito.length > 0 && (
              <button
                onClick={() => setCarrito([])}
                style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: 600 }}
              >
                Vaciar Carrito
              </button>
            )}
          </div>

          {/* LISTA DEL CARRITO */}
          <div style={{ marginBottom: "1.25rem", minHeight: "200px", maxHeight: "320px", overflowY: "auto" }}>
            {carrito.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                <ShoppingCart size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.3 }} />
                <p style={{ fontSize: "0.9rem" }}>No hay productos en el carrito.</p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>Selecciona artículos del catálogo a la izquierda.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {carrito.map((item) => (
                  <div
                    key={item.articulo.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.65rem 0.85rem",
                      backgroundColor: "#faf6f0",
                      borderRadius: "var(--border-radius-sm)",
                      border: "1px solid #f0e6d8"
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: "0.5rem" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{item.articulo.nombre}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        ${item.precioUnit.toLocaleString("es-AR", { minimumFractionDigits: 2 })} c/u
                      </div>
                    </div>

                    {/* Controles de cantidad */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginRight: "1rem" }}>
                      <button
                        onClick={() => handleUpdateQuantity(item.articulo.id, -1)}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          border: "1px solid #d1d5db",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: 800, fontSize: "0.9rem", minWidth: "20px", textAlign: "center" }}>
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.articulo.id, 1)}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          border: "1px solid #d1d5db",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ textAlign: "right", minWidth: "75px" }}>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--color-brand-primary)" }}>
                        ${(item.cantidad * item.precioUnit).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.articulo.id)}
                      style={{ color: "#dc2626", marginLeft: "0.5rem" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DATOS DEL CLIENTE Y PAGO */}
          <div style={{ borderTop: "1.5px solid var(--border-color)", paddingTop: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Consumidor Final"
                  style={{ width: "100%", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Método de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  style={{ width: "100%", fontSize: "0.85rem" }}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="MERCADOPAGO">Mercado Pago</option>
                  <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                Nota / Observación
              </label>
              <input
                type="text"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej: Pedido personalizado listo para retirar"
                style={{ width: "100%", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* TOTAL Y BOTÓN DE CONFIRMACIÓN */}
          <div style={{
            backgroundColor: "#fdf8f4",
            padding: "1rem 1.25rem",
            borderRadius: "var(--border-radius-md)",
            border: "1.5px solid #fed7aa",
            marginBottom: "1rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#374151" }}>TOTAL A COBRAR:</span>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-brand-primary)" }}>
                ${totalVenta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={handleProcesarVenta}
            disabled={submitting || carrito.length === 0}
            className="btn-action-orange"
            style={{
              padding: "0.85rem",
              fontSize: "1rem",
              opacity: submitting || carrito.length === 0 ? 0.6 : 1
            }}
          >
            <Receipt size={20} />
            <span>{submitting ? "Emitiendo Venta..." : "Cobrar y Emitir Comprobante"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
