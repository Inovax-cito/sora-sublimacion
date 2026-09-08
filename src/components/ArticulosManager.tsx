"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Articulo, ComponenteCombo } from "@/types";
import { 
  Plus, 
  UploadCloud, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  AlertCircle, 
  Grid, 
  List, 
  Package, 
  CheckCircle2,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ArticulosManagerProps {
  articulos: Articulo[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  searchQuery: string;
  onQuickSell?: (articulo: Articulo) => void;
  onQuickBuy?: (articulo: Articulo) => void;
}

export default function ArticulosManager({
  articulos,
  loading,
  onRefresh,
  isModalOpen,
  setIsModalOpen,
  searchQuery,
  onQuickSell,
  onQuickBuy,
}: ArticulosManagerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("Todas");
  const [sortBy, setSortBy] = useState<string>("recientes");
  const [expandedComboId, setExpandedComboId] = useState<number | null>(null);

  // Formulario state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    categoria: "Sublimación",
    descripcion: "",
    imagenUrl: "",
    precioCompra: "",
    precioVenta: "",
    stockActual: "10",
    stockMinimo: "5",
    esCombo: false,
  });

  // Componentes de combo dinámicos
  const [componentesList, setComponentesList] = useState<
    Array<{ nombre: string; costoUnitario: string; cantidad: string }>
  >([
    { nombre: "Caja Kraft con visor", costoUnitario: "500", cantidad: "1" },
    { nombre: "Viruta Popurrí aromático", costoUnitario: "200", cantidad: "1" },
    { nombre: "Taza Sublimada", costoUnitario: "2000", cantidad: "1" },
    { nombre: "Tarjeta mensaje 300g", costoUnitario: "150", cantidad: "1" },
  ]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const categorias = ["Todas", ...Array.from(new Set(articulos.map((a) => a.categoria)))];

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      codigo: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      nombre: "",
      categoria: "Sublimación",
      descripcion: "",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: "1500",
      precioVenta: "3500",
      stockActual: "10",
      stockMinimo: "5",
      esCombo: false,
    });
    setComponentesList([
      { nombre: "Caja decorativa", costoUnitario: "500", cantidad: "1" },
      { nombre: "Popurrí aromático", costoUnitario: "200", cantidad: "1" },
      { nombre: "Taza personalizada", costoUnitario: "2200", cantidad: "1" },
      { nombre: "Tarjeta dedicatoria", costoUnitario: "150", cantidad: "1" },
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (articulo: Articulo) => {
    setEditingId(articulo.id);
    setFormData({
      codigo: articulo.codigo,
      nombre: articulo.nombre,
      categoria: articulo.categoria,
      descripcion: articulo.descripcion || "",
      imagenUrl: articulo.imagenUrl || "/logo-sora.jpeg",
      precioCompra: articulo.precioCompra.toString(),
      precioVenta: articulo.precioVenta.toString(),
      stockActual: articulo.stockActual.toString(),
      stockMinimo: articulo.stockMinimo.toString(),
      esCombo: Boolean(articulo.esCombo),
    });

    if (articulo.componentes && articulo.componentes.length > 0) {
      setComponentesList(
        articulo.componentes.map((c) => ({
          nombre: c.nombre,
          costoUnitario: c.costoUnitario.toString(),
          cantidad: c.cantidad.toString(),
        }))
      );
    } else {
      setComponentesList([
        { nombre: "Caja Kraft", costoUnitario: "500", cantidad: "1" },
        { nombre: "Popurrí aromático", costoUnitario: "200", cantidad: "1" },
        { nombre: "Taza sublimada", costoUnitario: "2000", cantidad: "1" },
      ]);
    }

    setFormError(null);
    setIsModalOpen(true);
  };

  // Agregar componente a la lista de combo
  const handleAddComponente = () => {
    setComponentesList([...componentesList, { nombre: "", costoUnitario: "0", cantidad: "1" }]);
  };

  const handleRemoveComponente = (index: number) => {
    setComponentesList(componentesList.filter((_, i) => i !== index));
  };

  const handleUpdateComponente = (index: number, field: string, value: string) => {
    const updated = [...componentesList];
    (updated[index] as any)[field] = value;
    setComponentesList(updated);
  };

  // Calcular costo total sumando componentes del combo
  const costoTotalComboCalculado = componentesList.reduce((acc, c) => {
    const costo = parseFloat(c.costoUnitario) || 0;
    const cant = parseInt(c.cantidad, 10) || 1;
    return acc + costo * cant;
  }, 0);

  // Subida de imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir imagen");

      setFormData((prev) => ({ ...prev, imagenUrl: data.url }));
      showToast("success", "Imagen cargada correctamente");
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Enviar formulario
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const esCombo = formData.esCombo;
    const precioCompraFinal = esCombo
      ? costoTotalComboCalculado
      : parseFloat(formData.precioCompra) || 0;

    const payload = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      categoria: esCombo && formData.categoria === "Sublimación" ? "Boxes & Combos" : formData.categoria,
      descripcion: formData.descripcion,
      imagenUrl: formData.imagenUrl,
      precioCompra: precioCompraFinal,
      precioVenta: parseFloat(formData.precioVenta) || 0,
      stockActual: parseInt(formData.stockActual, 10) || 0,
      stockMinimo: parseInt(formData.stockMinimo, 10) || 5,
      esCombo: esCombo,
      componentes: esCombo
        ? componentesList.map((c) => ({
            nombre: c.nombre,
            costoUnitario: parseFloat(c.costoUnitario) || 0,
            cantidad: parseInt(c.cantidad, 10) || 1,
          }))
        : [],
    };

    try {
      const url = editingId ? `/api/articulos/${editingId}` : "/api/articulos";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el artículo");

      showToast("success", editingId ? "Artículo actualizado con éxito" : "Artículo/Combo creado con éxito");
      setIsModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Eliminar artículo
  const handleDeleteArticle = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el artículo "${nombre}"?`)) return;

    try {
      const res = await fetch(`/api/articulos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      showToast("success", "Artículo eliminado correctamente");
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtrado y ordenamiento
  const articulosFiltrados = articulos
    .filter((a) => {
      const matchesSearch =
        a.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.categoria.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategoria === "Todas" || a.categoria === selectedCategoria;

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === "mayor-margen") return (b.margenGanancia || 0) - (a.margenGanancia || 0);
      if (sortBy === "menor-margen") return (a.margenGanancia || 0) - (b.margenGanancia || 0);
      if (sortBy === "mayor-precio") return b.precioVenta - a.precioVenta;
      if (sortBy === "menor-precio") return a.precioVenta - b.precioVenta;
      if (sortBy === "menor-stock") return a.stockActual - b.stockActual;
      return b.id - a.id;
    });

  // Cálculo en vivo del modal
  const pCompraNum = formData.esCombo ? costoTotalComboCalculado : parseFloat(formData.precioCompra) || 0;
  const pVentaNum = parseFloat(formData.precioVenta) || 0;
  const margenPreview = pCompraNum > 0 ? (((pVentaNum - pCompraNum) / pCompraNum) * 100).toFixed(1) : "0.0";
  const gananciaPreview = (pVentaNum - pCompraNum).toFixed(2);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem" }}>
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: toastMessage.type === "success" ? "var(--color-brand-primary)" : "#dc2626",
          color: "#ffffff",
          padding: "0.85rem 1.4rem",
          borderRadius: "var(--border-radius-md)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          zIndex: 9999,
          fontWeight: 600,
        }}>
          <CheckCircle2 size={20} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Barra de herramientas y filtros */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "1.5rem",
        backgroundColor: "#ffffff",
        padding: "1rem 1.25rem",
        borderRadius: "var(--border-radius-md)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflowX: "auto", flex: "1 1 auto" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-muted)", marginRight: "0.25rem" }}>
            Categoría:
          </span>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "var(--border-radius-full)",
                fontSize: "0.8rem",
                fontWeight: 600,
                backgroundColor: selectedCategoria === cat ? "var(--color-brand-primary)" : "#f3f4f6",
                color: selectedCategoria === cat ? "#ffffff" : "var(--color-text-main)",
                border: "none",
                whiteSpace: "nowrap"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
            >
              <option value="recientes">Más recientes</option>
              <option value="mayor-margen">Mayor Margen (%)</option>
              <option value="menor-margen">Menor Margen (%)</option>
              <option value="mayor-precio">Mayor Precio Venta ($)</option>
              <option value="menor-precio">Menor Precio Venta ($)</option>
              <option value="menor-stock">Menor Stock (Reponer)</option>
            </select>
          </div>

          <div style={{ display: "flex", backgroundColor: "#f3f4f6", borderRadius: "var(--border-radius-sm)", padding: "2px" }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "0.4rem 0.65rem",
                borderRadius: "var(--border-radius-sm)",
                backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
                color: viewMode === "grid" ? "var(--color-brand-primary)" : "var(--color-text-muted)",
              }}
              title="Vista Tarjetas"
            >
              <Grid size={17} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "0.4rem 0.65rem",
                borderRadius: "var(--border-radius-sm)",
                backgroundColor: viewMode === "table" ? "#ffffff" : "transparent",
                color: viewMode === "table" ? "var(--color-brand-primary)" : "var(--color-text-muted)",
              }}
              title="Vista Tabla"
            >
              <List size={17} />
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="btn-primary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
          >
            <Plus size={16} />
            <span>Nuevo Artículo / Combo</span>
          </button>
        </div>
      </div>

      {/* Catálogo Grid / Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--color-text-muted)" }}>
          <Package size={40} style={{ animation: "bounce 1s infinite", marginBottom: "1rem" }} />
          <p style={{ fontWeight: 600 }}>Cargando catálogo oficial de Sora Sublimación...</p>
        </div>
      ) : articulosFiltrados.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
          borderRadius: "var(--border-radius-lg)",
          border: "2px dashed var(--border-color)"
        }}>
          <Package size={48} style={{ color: "var(--color-brand-primary)", marginBottom: "1rem" }} />
          <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No se encontraron artículos</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            {searchQuery ? `No hay coincidencias para "${searchQuery}"` : "Crea tu primer producto individual o Combo/Box."}
          </p>
          <button onClick={handleOpenCreateModal} className="btn-primary">
            <Plus size={18} />
            Crear Artículo o Combo
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: "1.5rem"
        }}>
          {articulosFiltrados.map((art) => {
            const margen = art.margenGanancia ?? 0;
            const esBajoStock = art.stockActual <= art.stockMinimo;
            const esCombo = art.esCombo;
            const isExpanded = expandedComboId === art.id;

            return (
              <div key={art.id} className="product-card">
                {/* Header de la tarjeta con badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "var(--color-text-muted)",
                      backgroundColor: "#f3f4f6",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px"
                    }}>
                      {art.codigo}
                    </span>
                    {esCombo && (
                      <span className="badge badge-wine" style={{ fontSize: "0.68rem", backgroundColor: "#fef3c7", color: "#b45309", borderColor: "#fde68a" }}>
                        <Gift size={11} style={{ marginRight: "3px" }} />
                        Combo Box
                      </span>
                    )}
                  </div>

                  <span className={`badge ${esBajoStock ? "badge-red" : "badge-green"}`}>
                    Stock: {art.stockActual} u.
                  </span>
                </div>

                {/* Imagen del producto */}
                <div style={{
                  position: "relative",
                  width: "100%",
                  height: "220px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #f3f4f6"
                }}>
                  <Image
                    src={art.imagenUrl || "/logo-sora.jpeg"}
                    alt={art.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    style={{ objectFit: "contain", padding: "0.5rem" }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    backgroundColor: margen >= 50 ? "#15803d" : margen >= 20 ? "#b45309" : "#dc2626",
                    color: "#ffffff",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "var(--border-radius-full)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                  }}>
                    +{margen}% Ganancia
                  </div>
                </div>

                {/* Título y Categoría */}
                <h3 style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--color-brand-primary)",
                  marginBottom: "0.3rem",
                  lineHeight: 1.3,
                  minHeight: "2.6rem"
                }}>
                  {art.nombre}
                </h3>

                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                  Tipo: <strong style={{ color: "#0284c7" }}>{art.categoria}</strong>
                </div>

                {/* Si es combo: Sección desplegable de componentes/artefactos */}
                {esCombo && art.componentes && art.componentes.length > 0 && (
                  <div style={{
                    backgroundColor: "#fdf8f4",
                    border: "1px dashed #fed7aa",
                    borderRadius: "var(--border-radius-sm)",
                    padding: "0.6rem 0.75rem",
                    marginBottom: "0.85rem"
                  }}>
                    <div
                      onClick={() => setExpandedComboId(isExpanded ? null : art.id)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#9a3412"
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Layers size={13} />
                        Incluye {art.componentes.length} artefactos desglosados
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem" }}>
                        {art.componentes.map((c, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ffedd5", paddingBottom: "2px" }}>
                            <span>• {c.cantidad}x {c.nombre}</span>
                            <span style={{ fontWeight: 600 }}>${c.costoUnitario} c/u</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Desglose de Precios */}
                <div style={{
                  backgroundColor: "#faf6f0",
                  padding: "0.75rem",
                  borderRadius: "var(--border-radius-sm)",
                  marginBottom: "1rem",
                  border: "1px solid #f0e6d8"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                      {esCombo ? "Costo Total Caja:" : "Precio Compra:"}
                    </span>
                    <strong style={{ fontSize: "0.9rem", color: "#374151" }}>
                      ${art.precioCompra.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text-main)" }}>Precio Venta Final:</span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-brand-primary)" }}>
                      ${art.precioVenta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "0.75rem",
                    color: "var(--color-success)",
                    textAlign: "right",
                    marginTop: "0.2rem",
                    fontWeight: 600
                  }}>
                    Ganancia neta: +${(art.precioVenta - art.precioCompra).toLocaleString("es-AR", { minimumFractionDigits: 2 })} por unidad
                  </div>
                </div>

                {/* Botones de acción */}
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button
                    onClick={() => onQuickSell && onQuickSell(art)}
                    disabled={art.stockActual <= 0}
                    className="btn-action-orange"
                    style={{
                      opacity: art.stockActual <= 0 ? 0.6 : 1,
                      cursor: art.stockActual <= 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    <ShoppingCart size={18} />
                    {art.stockActual <= 0 ? "Sin Stock" : "Añadir a Venta"}
                  </button>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <button
                      onClick={() => onQuickBuy && onQuickBuy(art)}
                      className="btn-outline"
                      style={{ flex: 1, justifyContent: "center", fontSize: "0.8rem", padding: "0.45rem" }}
                      title="Registrar compra o armado de stock"
                    >
                      <ShoppingBag size={15} />
                      Comprar +
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(art)}
                      className="btn-outline"
                      style={{ padding: "0.45rem 0.6rem" }}
                      title="Editar precios o artefactos"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(art.id, art.nombre)}
                      className="btn-outline"
                      style={{ padding: "0.45rem 0.6rem", color: "#dc2626", borderColor: "#fecaca" }}
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Costo Compra / Insumos ($)</th>
                <th>Precio Venta ($)</th>
                <th>Ganancia / Ud ($)</th>
                <th>Margen (%)</th>
                <th>Stock</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {articulosFiltrados.map((art) => {
                const margen = art.margenGanancia ?? 0;
                const ganancia = art.precioVenta - art.precioCompra;

                return (
                  <tr key={art.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--color-text-muted)" }}>{art.codigo}</span>
                    </td>
                    <td>
                      <div style={{ width: "42px", height: "42px", position: "relative", borderRadius: "6px", overflow: "hidden" }}>
                        <Image
                          src={art.imagenUrl || "/logo-sora.jpeg"}
                          alt={art.nombre}
                          fill
                          sizes="42px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </td>
                    <td>
                      <strong>{art.nombre}</strong>
                      {art.esCombo && (
                        <div style={{ fontSize: "0.74rem", color: "#b45309", fontWeight: 700 }}>
                          🎁 Combo ({art.componentes?.length || 0} artefactos)
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-wine">{art.categoria}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${art.precioCompra.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontWeight: 800, color: "var(--color-brand-primary)", fontSize: "1rem" }}>
                      ${art.precioVenta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontWeight: 700, color: ganancia >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                      +${ganancia.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${margen >= 50 ? "badge-green" : margen >= 20 ? "badge-amber" : "badge-red"}`}>
                        +{margen}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${art.stockActual <= art.stockMinimo ? "badge-red" : "badge-green"}`}>
                        {art.stockActual} u.
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => onQuickSell && onQuickSell(art)}
                          className="btn-outline"
                          style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem", backgroundColor: "var(--color-accent-orange)", color: "#fff", border: "none" }}
                          disabled={art.stockActual <= 0}
                        >
                          Vender
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(art)}
                          className="btn-outline"
                          style={{ padding: "0.35rem 0.55rem" }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id, art.nombre)}
                          className="btn-outline"
                          style={{ padding: "0.35rem 0.55rem", color: "#dc2626" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR / EDITAR CON SOPORTE DE COMBOS / BOXES */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <div style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "var(--color-brand-primary)" }}>
                {editingId ? "Editar Artículo o Combo" : "Nuevo Artículo / Box de Regalo"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ fontSize: "1.25rem", color: "var(--color-text-muted)", fontWeight: "bold" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ padding: "1.5rem" }}>
              {formError && (
                <div style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--color-danger-bg)",
                  color: "var(--color-danger)",
                  border: "1px solid var(--color-danger-border)",
                  borderRadius: "var(--border-radius-sm)",
                  marginBottom: "1rem",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              {/* SELECTOR DE TIPO: ¿Simple o Combo Box? */}
              <div style={{
                backgroundColor: "#faf6f0",
                padding: "0.75rem 1rem",
                borderRadius: "var(--border-radius-md)",
                border: "1.5px solid #f0e6d8",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div>
                  <strong style={{ fontSize: "0.9rem", color: "var(--color-brand-primary)" }}>
                    Tipo de Producto:
                  </strong>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Elige si vendes un artículo unitario o una caja/combo con varios artefactos adentro.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, esCombo: false })}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "var(--border-radius-full)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      backgroundColor: !formData.esCombo ? "var(--color-brand-primary)" : "#ffffff",
                      color: !formData.esCombo ? "#ffffff" : "var(--color-text-main)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    Artículo Simple
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, esCombo: true, categoria: "Boxes & Combos" })}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "var(--border-radius-full)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      backgroundColor: formData.esCombo ? "#b45309" : "#ffffff",
                      color: formData.esCombo ? "#ffffff" : "var(--color-text-main)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem"
                    }}
                  >
                    <Gift size={14} />
                    Combo / Box
                  </button>
                </div>
              </div>

              {/* Subida de Imagen */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Foto del Producto / Caja
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    position: "relative",
                    borderRadius: "12px",
                    border: "2px dashed var(--border-color)",
                    overflow: "hidden",
                    backgroundColor: "#f9fafb"
                  }}>
                    <Image
                      src={formData.imagenUrl || "/logo-sora.jpeg"}
                      alt="Vista previa"
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      padding: "0.5rem 1rem",
                      borderRadius: "var(--border-radius-full)",
                      border: "1.5px solid var(--color-brand-primary)",
                      color: "var(--color-brand-primary)",
                      fontWeight: 600,
                      fontSize: "0.82rem"
                    }}>
                      <UploadCloud size={16} />
                      <span>{uploadingImage ? "Subiendo..." : "Subir Foto desde Archivo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Código y Nombre */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Código / SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder={formData.esCombo ? "BOX-003" : "PROD-101"}
                    style={{ width: "100%", textTransform: "uppercase" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Nombre {formData.esCombo ? "del Combo / Box" : "del Artículo"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder={formData.esCombo ? "Ej: Box Cumpleaños con Taza, Popurrí y Tarjeta" : "Ej: Taza Cerámica Sublimada"}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Categoría y Descripción */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="Sublimación">Sublimación General</option>
                    <option value="Boxes & Combos">Boxes & Combos (Regalos)</option>
                    <option value="Tazas">Tazas & Mugs</option>
                    <option value="Textil">Textil (Remeras, Buzos)</option>
                    <option value="Gorras">Gorras & Sombreros</option>
                    <option value="Botellas">Botellas & Termos</option>
                    <option value="Accesorios">Accesorios & Llaveros</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Descripción o Contenido
                  </label>
                  <textarea
                    rows={2}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Detalles sobre lo que incluye o características..."
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>
              </div>

              {/* SI ES COMBO: TABLA DE ARTEFACTOS DESGLOSADOS */}
              {formData.esCombo && (
                <div style={{
                  backgroundColor: "#fffbeb",
                  border: "1.5px solid #fde68a",
                  borderRadius: "var(--border-radius-md)",
                  padding: "1rem",
                  marginBottom: "1.25rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#b45309", fontWeight: 800, fontSize: "0.9rem" }}>
                      <Gift size={18} />
                      <span>Desglose de Artefactos de la Caja / Combo</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddComponente}
                      className="btn-outline"
                      style={{ padding: "0.3rem 0.75rem", fontSize: "0.78rem", backgroundColor: "#ffffff" }}
                    >
                      <Plus size={14} />
                      <span>Agregar Artefacto</span>
                    </button>
                  </div>

                  <p style={{ fontSize: "0.75rem", color: "#78350f", marginBottom: "0.75rem" }}>
                    Escribe cuánto te sale cada artefacto o insumo por separado (taza, popurrí, caja, tarjeta, etc.). El sistema sumará todo automáticamente para darte el costo total.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {componentesList.map((comp, idx) => {
                      const costUnit = parseFloat(comp.costoUnitario) || 0;
                      const cant = parseInt(comp.cantidad, 10) || 1;
                      const subtotal = costUnit * cant;

                      return (
                        <div
                          key={idx}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                            gap: "0.5rem",
                            alignItems: "center",
                            backgroundColor: "#ffffff",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "6px",
                            border: "1px solid #fef3c7"
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Nombre (ej: Popurrí, Taza)"
                            value={comp.nombre}
                            onChange={(e) => handleUpdateComponente(idx, "nombre", e.target.value)}
                            style={{ fontSize: "0.82rem", padding: "0.4rem 0.5rem" }}
                            required
                          />
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "6px", top: "7px", fontSize: "0.75rem", color: "#666" }}>$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Costo u."
                              value={comp.costoUnitario}
                              onChange={(e) => handleUpdateComponente(idx, "costoUnitario", e.target.value)}
                              style={{ fontSize: "0.82rem", padding: "0.4rem 0.5rem 0.4rem 1.2rem", width: "100%" }}
                              required
                            />
                          </div>
                          <input
                            type="number"
                            min="1"
                            placeholder="Cant"
                            value={comp.cantidad}
                            onChange={(e) => handleUpdateComponente(idx, "cantidad", e.target.value)}
                            style={{ fontSize: "0.82rem", padding: "0.4rem 0.5rem", width: "100%" }}
                            required
                          />
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>
                            = ${subtotal.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveComponente(idx)}
                            disabled={componentesList.length <= 1}
                            style={{ color: "#dc2626", padding: "0.2rem" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen de suma total de componentes */}
                  <div style={{
                    marginTop: "0.85rem",
                    padding: "0.6rem 0.75rem",
                    backgroundColor: "#fef3c7",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#78350f" }}>
                      COSTO TOTAL CONVERSIÓN (Suma de artefactos):
                    </span>
                    <strong style={{ fontSize: "1.1rem", color: "#b45309" }}>
                      ${costoTotalComboCalculado.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              )}

              {/* SECCIÓN FINANCIERA: Precio Compra, Precio Venta y Márgenes */}
              <div style={{
                backgroundColor: "#fdf8f4",
                border: "1.5px solid #fed7aa",
                borderRadius: "var(--border-radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "var(--color-brand-primary)",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  marginBottom: "0.75rem"
                }}>
                  <TrendingUp size={18} />
                  <span>Configuración de Precios y Ganancia Final</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                      {formData.esCombo ? "Costo Total de Artefactos ($):" : "Precio de Compra / Costo ($) *"}
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "10px", top: "9px", color: "var(--color-text-muted)" }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        disabled={formData.esCombo}
                        value={formData.esCombo ? costoTotalComboCalculado.toFixed(2) : formData.precioCompra}
                        onChange={(e) => setFormData({ ...formData, precioCompra: e.target.value })}
                        style={{ width: "100%", paddingLeft: "1.8rem", backgroundColor: formData.esCombo ? "#f3f4f6" : "#ffffff" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                      Precio de Venta Final al Público ($) *
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "10px", top: "9px", color: "var(--color-text-muted)" }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.precioVenta}
                        onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
                        placeholder="0.00"
                        style={{ width: "100%", paddingLeft: "1.8rem", fontWeight: "bold" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cálculo Dinámico de Rentabilidad */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--border-radius-sm)",
                  border: "1px solid #fed7aa"
                }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Ganancia Neta por {formData.esCombo ? "Caja" : "Unidad"}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: parseFloat(gananciaPreview) >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                      +${gananciaPreview}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Margen de Beneficio</div>
                    <span className={`badge ${parseFloat(margenPreview) >= 50 ? "badge-green" : parseFloat(margenPreview) >= 20 ? "badge-amber" : "badge-red"}`} style={{ fontSize: "0.85rem" }}>
                      +{margenPreview}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Stock Inicial ({formData.esCombo ? "Cajas Disponibles" : "Unidades"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockActual}
                    onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Stock Mínimo de Alerta
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Botones del Modal */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-primary"
                  style={{ minWidth: "160px", justifyContent: "center" }}
                >
                  {formSubmitting ? "Guardando..." : editingId ? "Guardar Cambios" : formData.esCombo ? "Crear Combo / Box" : "Crear Artículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
