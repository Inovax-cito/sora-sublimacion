import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [articulos, compras, ventas, configMeta] = await Promise.all([
      prisma.articulo.findMany({
        orderBy: { nombre: "asc" },
        include: { componentes: true },
      }),
      prisma.compra.findMany({
        orderBy: { fecha: "desc" },
        include: {
          detalles: {
            include: {
              articulo: { select: { nombre: true, codigo: true } },
            },
          },
        },
      }),
      prisma.venta.findMany({
        orderBy: { fecha: "desc" },
        include: {
          detalles: {
            include: {
              articulo: { select: { nombre: true, codigo: true, precioCompra: true } },
            },
          },
        },
      }),
      prisma.configuracion.findUnique({
        where: { clave: "meta_ganancia" },
      }),
    ]);

    // Métricas financieras
    const totalVentasMonetario = ventas.reduce((acc, v) => acc + Number(v.total), 0);
    const totalComprasMonetario = compras.reduce((acc, c) => acc + Number(c.total), 0);
    const balanceNeto = totalVentasMonetario - totalComprasMonetario;

    const metaGanancia = configMeta ? parseFloat(configMeta.valor) || 1000000 : 1000000;
    // Progreso basado en ingresos totales por venta
    const progresoMetaPorcentaje = metaGanancia > 0
      ? Number(Math.min(100, Math.max(0, (totalVentasMonetario / metaGanancia) * 100)).toFixed(1))
      : 0;
    const montoFaltanteMeta = Math.max(0, Number((metaGanancia - totalVentasMonetario).toFixed(2)));

    let valorInventarioCosto = 0;
    let valorInventarioVenta = 0;
    const articulosBajoStock: any[] = [];

    for (const art of articulos) {
      const pCompra = Number(art.precioCompra);
      const pVenta = Number(art.precioVenta);
      const stock = art.stockActual;

      valorInventarioCosto += pCompra * stock;
      valorInventarioVenta += pVenta * stock;

      if (stock <= art.stockMinimo) {
        articulosBajoStock.push({
          ...art,
          precioCompra: pCompra,
          precioVenta: pVenta,
          margenGanancia:
            pCompra > 0 ? Number((((pVenta - pCompra) / pCompra) * 100).toFixed(2)) : 0,
        });
      }
    }

    const gananciaPotencialInventario = valorInventarioVenta - valorInventarioCosto;

    return NextResponse.json({
      totalVentasMonetario: Number(totalVentasMonetario.toFixed(2)),
      totalComprasMonetario: Number(totalComprasMonetario.toFixed(2)),
      balanceNeto: Number(balanceNeto.toFixed(2)),
      cantidadVentas: ventas.length,
      cantidadCompras: compras.length,
      cantidadArticulos: articulos.length,
      valorInventarioCosto: Number(valorInventarioCosto.toFixed(2)),
      valorInventarioVenta: Number(valorInventarioVenta.toFixed(2)),
      gananciaPotencialInventario: Number(gananciaPotencialInventario.toFixed(2)),
      metaGanancia,
      progresoMetaPorcentaje,
      montoFaltanteMeta,
      articulosBajoStock,
      ultimasVentas: ventas.slice(0, 5).map((v) => ({
        ...v,
        total: Number(v.total),
      })),
      ultimasCompras: compras.slice(0, 5).map((c) => ({
        ...c,
        total: Number(c.total),
      })),
    });
  } catch (error: any) {
    console.error("Error al calcular estadísticas del dashboard:", error);
    return NextResponse.json(
      { error: "Error al obtener datos estadísticos" },
      { status: 500 }
    );
  }
}
