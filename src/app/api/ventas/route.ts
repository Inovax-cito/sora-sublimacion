import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const ventas = await prisma.venta.findMany({
      orderBy: { fecha: "desc" },
      include: {
        detalles: {
          include: {
            articulo: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                categoria: true,
                precioCompra: true,
                imagenUrl: true,
              },
            },
          },
        },
      },
    });

    const ventasFormateadas = ventas.map((venta) => ({
      ...venta,
      total: Number(venta.total),
      detalles: venta.detalles.map((d) => ({
        ...d,
        precioUnit: Number(d.precioUnit),
        subtotal: Number(d.subtotal),
        articulo: d.articulo
          ? {
              ...d.articulo,
              precioCompra: Number(d.articulo.precioCompra),
            }
          : undefined,
      })),
    }));

    return NextResponse.json(ventasFormateadas);
  } catch (error: any) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "Error al consultar el historial de ventas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { numeroTicket, cliente, metodoPago, observacion, detalles } = body;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un artículo para registrar la venta" },
        { status: 400 }
      );
    }

    // 1. REGLA FUNDAMENTAL: Verificar que todos los artículos existen en la base de datos
    const articulosIds = detalles.map((d: any) => parseInt(d.articuloId, 10));
    const articulosEncontrados = await prisma.articulo.findMany({
      where: { id: { in: articulosIds } },
    });

    if (articulosEncontrados.length !== articulosIds.length) {
      const idsExistentes = new Set(articulosEncontrados.map((a) => a.id));
      const idsFaltantes = articulosIds.filter((id: number) => !idsExistentes.has(id));
      return NextResponse.json(
        {
          error: `Operación rechazada: Los artículos con ID [${idsFaltantes.join(
            ", "
          )}] no existen en la base de datos. No se puede vender un artículo que no esté previamente registrado en el catálogo.`,
        },
        { status: 400 }
      );
    }

    // Mapa de artículos para acceso rápido
    const articulosMap = new Map(articulosEncontrados.map((a) => [a.id, a]));

    // 2. Comprobar stock disponible para cada artículo
    for (const item of detalles) {
      const artId = parseInt(item.articuloId, 10);
      const cant = parseInt(item.cantidad, 10);
      const articulo = articulosMap.get(artId)!;

      if (isNaN(cant) || cant <= 0) {
        return NextResponse.json(
          { error: `La cantidad solicitada para "${articulo.nombre}" debe ser mayor a 0` },
          { status: 400 }
        );
      }

      if (articulo.stockActual < cant) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para "${articulo.nombre}" (${articulo.codigo}): Disponibles: ${articulo.stockActual} unidades, Solicitadas: ${cant} unidades.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Ejecución atómica de la venta y deducción de stock
    const resultado = await prisma.$transaction(async (tx) => {
      let totalCalculado = 0;
      const detallesAInsertar = [];

      for (const item of detalles) {
        const artId = parseInt(item.articuloId, 10);
        const cant = parseInt(item.cantidad, 10);
        const articulo = articulosMap.get(artId)!;
        const precioUnit =
          item.precioUnit !== undefined ? Number(item.precioUnit) : Number(articulo.precioVenta);
        const subtotal = cant * precioUnit;
        totalCalculado += subtotal;

        detallesAInsertar.push({
          articuloId: artId,
          cantidad: cant,
          precioUnit: precioUnit,
          subtotal: subtotal,
        });

        // Descontar stock
        await tx.articulo.update({
          where: { id: artId },
          data: {
            stockActual: { decrement: cant },
          },
        });
      }

      const nuevaVenta = await tx.venta.create({
        data: {
          numeroTicket: numeroTicket?.trim() || `TICK-${Date.now().toString().slice(-6)}`,
          cliente: cliente?.trim() || "Consumidor Final",
          metodoPago: metodoPago?.trim() || "EFECTIVO",
          observacion: observacion?.trim() || null,
          total: totalCalculado,
          detalles: {
            create: detallesAInsertar,
          },
        },
        include: {
          detalles: {
            include: {
              articulo: true,
            },
          },
        },
      });

      return nuevaVenta;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Venta procesada con éxito y stock descontado",
        venta: {
          ...resultado,
          total: Number(resultado.total),
          detalles: resultado.detalles.map((d) => ({
            ...d,
            precioUnit: Number(d.precioUnit),
            subtotal: Number(d.subtotal),
          })),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al procesar venta:", error);
    return NextResponse.json(
      { error: "Error en la transacción al procesar la venta: " + error.message },
      { status: 500 }
    );
  }
}
