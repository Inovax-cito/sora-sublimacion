import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const compras = await prisma.compra.findMany({
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
                imagenUrl: true,
              },
            },
          },
        },
      },
    });

    const comprasFormateadas = compras.map((compra) => ({
      ...compra,
      total: Number(compra.total),
      detalles: compra.detalles.map((d) => ({
        ...d,
        precioUnit: Number(d.precioUnit),
        subtotal: Number(d.subtotal),
      })),
    }));

    return NextResponse.json(comprasFormateadas);
  } catch (error: any) {
    console.error("Error al obtener compras:", error);
    return NextResponse.json(
      { error: "Error al consultar el registro de compras" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { comprobante, proveedor, observacion, detalles } = body;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un artículo para registrar la compra" },
        { status: 400 }
      );
    }

    // 1. REGLA FUNDAMENTAL: Verificar existencia de cada artículo antes de proceder
    const articulosIds = detalles.map((d: any) => parseInt(d.articuloId, 10));
    const articulosEncontrados = await prisma.articulo.findMany({
      where: { id: { in: articulosIds } },
    });

    if (articulosEncontrados.length !== articulosIds.length) {
      const idsExistentes = new Set(articulosEncontrados.map((a) => a.id));
      const idsFaltantes = articulosIds.filter((id: number) => !idsExistentes.has(id));
      return NextResponse.json(
        {
          error: `No se puede registrar la compra: los artículos con ID [${idsFaltantes.join(
            ", "
          )}] no existen en la base de datos. Primero deben crearse en el catálogo de artículos.`,
        },
        { status: 400 }
      );
    }

    // Validar cantidades y precios unitarios
    for (const item of detalles) {
      const cant = parseInt(item.cantidad, 10);
      const precio = Number(item.precioUnit);
      if (isNaN(cant) || cant <= 0) {
        return NextResponse.json(
          { error: "La cantidad comprada de cada artículo debe ser un número entero mayor a cero" },
          { status: 400 }
        );
      }
      if (isNaN(precio) || precio < 0) {
        return NextResponse.json(
          { error: "El precio unitario de compra debe ser un número positivo o cero" },
          { status: 400 }
        );
      }
    }

    // 2. Transacción atómica en Prisma:
    // Guarda la compra, los detalles y actualiza el stock/precio de los artículos simultáneamente
    const resultado = await prisma.$transaction(async (tx) => {
      let totalCalculado = 0;
      const detallesAInsertar = [];

      for (const item of detalles) {
        const artId = parseInt(item.articuloId, 10);
        const cant = parseInt(item.cantidad, 10);
        const precioUnit = Number(item.precioUnit);
        const subtotal = cant * precioUnit;
        totalCalculado += subtotal;

        detallesAInsertar.push({
          articuloId: artId,
          cantidad: cant,
          precioUnit: precioUnit,
          subtotal: subtotal,
        });

        // Actualizar stock del artículo (incrementar existencia de inventario)
        // Opcionalmente actualizar el precio de compra del artículo si fue modificado
        const updateData: any = {
          stockActual: { increment: cant },
        };

        if (item.actualizarPrecioCompra) {
          updateData.precioCompra = precioUnit;
        }

        await tx.articulo.update({
          where: { id: artId },
          data: updateData,
        });
      }

      const nuevaCompra = await tx.compra.create({
        data: {
          comprobante: comprobante?.trim() || null,
          proveedor: proveedor?.trim() || null,
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

      return nuevaCompra;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Compra registrada con éxito y stock actualizado",
        compra: {
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
    console.error("Error al registrar compra:", error);
    return NextResponse.json(
      { error: "Error en la transacción al registrar la compra: " + error.message },
      { status: 500 }
    );
  }
}
