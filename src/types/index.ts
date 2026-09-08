export interface ComponenteCombo {
  id?: number;
  articuloPadreId?: number;
  nombre: string;
  costoUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Articulo {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  esCombo: boolean;
  componentes?: ComponenteCombo[];
  creadoEn: string | Date;
  actualizadoEn: string | Date;
  margenGanancia?: number; // Porcentaje calculado: ((Venta - Compra) / Compra) * 100
  gananciaNeta?: number;   // Ganancia unitaria en moneda: Venta - Compra
}

export interface DetalleCompraInput {
  articuloId: number;
  cantidad: number;
  precioUnit: number;
  actualizarPrecioCompra?: boolean;
}

export interface DetalleCompra {
  id: number;
  compraId: number;
  articuloId: number;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  articulo?: Articulo;
}

export interface Compra {
  id: number;
  comprobante?: string | null;
  proveedor?: string | null;
  total: number;
  observacion?: string | null;
  fecha: string | Date;
  detalles: DetalleCompra[];
}

export interface DetalleVentaInput {
  articuloId: number;
  cantidad: number;
  precioUnit: number;
}

export interface DetalleVenta {
  id: number;
  ventaId: number;
  articuloId: number;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  articulo?: Articulo;
}

export interface Venta {
  id: number;
  numeroTicket?: string | null;
  cliente?: string | null;
  metodoPago: string;
  total: number;
  observacion?: string | null;
  fecha: string | Date;
  detalles: DetalleVenta[];
}

export interface DashboardSummary {
  totalVentasMonetario: number;
  totalComprasMonetario: number;
  balanceNeto: number;
  cantidadVentas: number;
  cantidadCompras: number;
  cantidadArticulos: number;
  valorInventarioCosto: number;
  valorInventarioVenta: number;
  gananciaPotencialInventario: number;
  metaGanancia: number;
  progresoMetaPorcentaje: number;
  montoFaltanteMeta: number;
  articulosBajoStock: Articulo[];
  ultimasVentas: Venta[];
  ultimasCompras: Compra[];
}
