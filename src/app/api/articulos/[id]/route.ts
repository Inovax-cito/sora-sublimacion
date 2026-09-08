import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const articuloId = parseInt(id, 10);

    if (isNaN(articuloId)) {
      return NextResponse.json({ error: "ID de artículo inválido" }, { status: 400 });
    }

    const articulo = await prisma.articulo.findUnique({
      where: { id: articuloId },
      include: {
        componentes: true,
        detallesCompra: {
          take: 10,
          orderBy: { id: "desc" },
          include: { compra: true },
        },
        detallesVenta: {
          take: 10,
          orderBy: { id: "desc" },
          include: { venta: true },
        },
      },
    });

    if (!articulo) {
      return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
    }

    const pCompra = Number(articulo.precioCompra);
    const pVenta = Number(articulo.precioVenta);
    const margenGanancia =
      pCompra > 0 ? Number((((pVenta - pCompra) / pCompra) * 100).toFixed(2)) : 0;
    const gananciaNeta = Number((pVenta - pCompra).toFixed(2));

    return NextResponse.json({
      ...articulo,
      precioCompra: pCompra,
      precioVenta: pVenta,
      margenGanancia,
      gananciaNeta,
      componentes: articulo.componentes.map((c) => ({
        ...c,
        costoUnitario: Number(c.costoUnitario),
        subtotal: Number(c.subtotal),
      })),
    });
  } catch (error: any) {
    console.error("Error al consultar artículo individual:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const articuloId = parseInt(id, 10);

    if (isNaN(articuloId)) {
      return NextResponse.json({ error: "ID de artículo inválido" }, { status: 400 });
    }

    const body = await req.json();
    const {
      codigo,
      nombre,
      categoria,
      descripcion,
      imagenUrl,
      precioCompra,
      precioVenta,
      stockActual,
      stockMinimo,
      esCombo,
      componentes,
    } = body;

    const articuloExistente = await prisma.articulo.findUnique({
      where: { id: articuloId },
      include: { componentes: true },
    });

    if (!articuloExistente) {
      return NextResponse.json({ error: "El artículo a actualizar no existe" }, { status: 404 });
    }

    // Si modificó el código, verificar duplicado
    if (codigo && codigo.trim().toUpperCase() !== articuloExistente.codigo) {
      const codigoDuplicado = await prisma.articulo.findUnique({
        where: { codigo: codigo.trim().toUpperCase() },
      });
      if (codigoDuplicado) {
        return NextResponse.json(
          { error: `El código "${codigo}" ya pertenece a otro producto` },
          { status: 409 }
        );
      }
    }

    let numPrecioCompra = precioCompra !== undefined ? Number(precioCompra) : Number(articuloExistente.precioCompra);
    const numPrecioVenta = precioVenta !== undefined ? Number(precioVenta) : Number(articuloExistente.precioVenta);

    const esComboBool = esCombo !== undefined ? Boolean(esCombo) : articuloExistente.esCombo;

    // Si es combo y se enviaron componentes, recalcular costo
    if (esComboBool && Array.isArray(componentes)) {
      let suma = 0;
      for (const comp of componentes) {
        suma += (Number(comp.costoUnitario) || 0) * (parseInt(comp.cantidad, 10) || 1);
      }
      numPrecioCompra = suma;
    }

    // Actualizar con transacción para componentes
    const articuloActualizado = await prisma.$transaction(async (tx) => {
      if (esComboBool && Array.isArray(componentes)) {
        await tx.componenteCombo.deleteMany({ where: { articuloPadreId: articuloId } });
        if (componentes.length > 0) {
          await tx.componenteCombo.createMany({
            data: componentes.map((c: any) => ({
              articuloPadreId: articuloId,
              nombre: c.nombre?.trim() || "Artefacto",
              costoUnitario: Number(c.costoUnitario) || 0,
              cantidad: parseInt(c.cantidad, 10) || 1,
              subtotal: (Number(c.costoUnitario) || 0) * (parseInt(c.cantidad, 10) || 1),
            })),
          });
        }
      }

      return await tx.articulo.update({
        where: { id: articuloId },
        data: {
          codigo: codigo ? codigo.trim().toUpperCase() : undefined,
          nombre: nombre ? nombre.trim() : undefined,
          categoria: categoria ? categoria.trim() : undefined,
          descripcion: descripcion !== undefined ? descripcion : undefined,
          imagenUrl: imagenUrl !== undefined ? imagenUrl : undefined,
          precioCompra: !isNaN(numPrecioCompra) ? numPrecioCompra : undefined,
          precioVenta: !isNaN(numPrecioVenta) ? numPrecioVenta : undefined,
          stockActual: stockActual !== undefined ? Math.max(0, parseInt(stockActual, 10)) : undefined,
          stockMinimo: stockMinimo !== undefined ? Math.max(0, parseInt(stockMinimo, 10)) : undefined,
          esCombo: esComboBool,
        },
        include: {
          componentes: true,
        },
      });
    });

    const pCompra = Number(articuloActualizado.precioCompra);
    const pVenta = Number(articuloActualizado.precioVenta);
    const margenGanancia =
      pCompra > 0 ? Number((((pVenta - pCompra) / pCompra) * 100).toFixed(2)) : 0;
    const gananciaNeta = Number((pVenta - pCompra).toFixed(2));

    return NextResponse.json({
      ...articuloActualizado,
      precioCompra: pCompra,
      precioVenta: pVenta,
      margenGanancia,
      gananciaNeta,
      componentes: articuloActualizado.componentes.map((c) => ({
        ...c,
        costoUnitario: Number(c.costoUnitario),
        subtotal: Number(c.subtotal),
      })),
    });
  } catch (error: any) {
    console.error("Error al actualizar artículo:", error);
    return NextResponse.json({ error: "Error en el servidor al actualizar: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const articuloId = parseInt(id, 10);

    if (isNaN(articuloId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const comprasAsociadas = await prisma.detalleCompra.count({ where: { articuloId } });
    const ventasAsociadas = await prisma.detalleVenta.count({ where: { articuloId } });

    if (comprasAsociadas > 0 || ventasAsociadas > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar este artículo porque posee historial contable (${comprasAsociadas} compras, ${ventasAsociadas} ventas). Puedes modificar sus datos o dejar su stock en 0.`,
        },
        { status: 400 }
      );
    }

    await prisma.articulo.delete({ where: { id: articuloId } });

    return NextResponse.json({
      success: true,
      message: "Artículo eliminado satisfactoriamente",
    });
  } catch (error: any) {
    console.error("Error al eliminar artículo:", error);
    return NextResponse.json({ error: "Error interno al eliminar el artículo" }, { status: 500 });
  }
}
