import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const categoria = searchParams.get("cat") || "";

    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { nombre: { contains: query } },
        { codigo: { contains: query } },
        { descripcion: { contains: query } },
      ];
    }

    if (categoria && categoria !== "Todas") {
      whereClause.categoria = categoria;
    }

    const articulos = await prisma.articulo.findMany({
      where: whereClause,
      include: {
        componentes: true,
      },
      orderBy: { creadoEn: "desc" },
    });

    // Mapeo y cálculo de métricas financieras por artículo
    const articulosFormateados = articulos.map((art) => {
      const pCompra = Number(art.precioCompra);
      const pVenta = Number(art.precioVenta);
      const margenGanancia =
        pCompra > 0 ? Number((((pVenta - pCompra) / pCompra) * 100).toFixed(2)) : 0;
      const gananciaNeta = Number((pVenta - pCompra).toFixed(2));

      return {
        ...art,
        precioCompra: pCompra,
        precioVenta: pVenta,
        margenGanancia,
        gananciaNeta,
        componentes: art.componentes.map((c) => ({
          ...c,
          costoUnitario: Number(c.costoUnitario),
          subtotal: Number(c.subtotal),
        })),
      };
    });

    return NextResponse.json(articulosFormateados);
  } catch (error: any) {
    console.error("Error al obtener artículos:", error);
    return NextResponse.json(
      { error: "Error al consultar los artículos en la base de datos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Validaciones de negocio
    if (!codigo || typeof codigo !== "string" || !codigo.trim()) {
      return NextResponse.json(
        { error: "El código o SKU del artículo es obligatorio" },
        { status: 400 }
      );
    }

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre del artículo es obligatorio" },
        { status: 400 }
      );
    }

    let numPrecioCompra = Number(precioCompra);
    const numPrecioVenta = Number(precioVenta);

    // Si es combo, calcular el costo sumando cada artefacto
    const esComboBool = Boolean(esCombo);
    const componentesAInsertar: any[] = [];

    if (esComboBool && Array.isArray(componentes) && componentes.length > 0) {
      let sumaCostoCombo = 0;
      for (const comp of componentes) {
        const costoUnit = Number(comp.costoUnitario) || 0;
        const cant = parseInt(comp.cantidad, 10) || 1;
        const subtotal = costoUnit * cant;
        sumaCostoCombo += subtotal;

        componentesAInsertar.push({
          nombre: comp.nombre?.trim() || "Artefacto",
          costoUnitario: costoUnit,
          cantidad: cant,
          subtotal: subtotal,
        });
      }
      numPrecioCompra = sumaCostoCombo; // Costo total calculado por artefactos
    }

    if (isNaN(numPrecioCompra) || numPrecioCompra < 0) {
      return NextResponse.json(
        { error: "El precio de compra debe ser un valor numérico positivo o cero" },
        { status: 400 }
      );
    }

    if (isNaN(numPrecioVenta) || numPrecioVenta < 0) {
      return NextResponse.json(
        { error: "El precio de venta debe ser un valor numérico positivo o cero" },
        { status: 400 }
      );
    }

    // Verificar si el código ya existe
    const codigoExistente = await prisma.articulo.findUnique({
      where: { codigo: codigo.trim().toUpperCase() },
    });

    if (codigoExistente) {
      return NextResponse.json(
        { error: `El código "${codigo.trim()}" ya está registrado para otro artículo` },
        { status: 409 }
      );
    }

    const nuevoArticulo = await prisma.articulo.create({
      data: {
        codigo: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        categoria: categoria?.trim() || "Sublimación",
        descripcion: descripcion?.trim() || null,
        imagenUrl: imagenUrl || null,
        precioCompra: numPrecioCompra,
        precioVenta: numPrecioVenta,
        stockActual: Math.max(0, parseInt(stockActual, 10) || 0),
        stockMinimo: Math.max(0, parseInt(stockMinimo, 10) || 5),
        esCombo: esComboBool,
        componentes: componentesAInsertar.length > 0 ? { create: componentesAInsertar } : undefined,
      },
      include: {
        componentes: true,
      },
    });

    const pCompra = Number(nuevoArticulo.precioCompra);
    const pVenta = Number(nuevoArticulo.precioVenta);
    const margenGanancia =
      pCompra > 0 ? Number((((pVenta - pCompra) / pCompra) * 100).toFixed(2)) : 0;
    const gananciaNeta = Number((pVenta - pCompra).toFixed(2));

    return NextResponse.json(
      {
        ...nuevoArticulo,
        precioCompra: pCompra,
        precioVenta: pVenta,
        margenGanancia,
        gananciaNeta,
        componentes: nuevoArticulo.componentes.map((c) => ({
          ...c,
          costoUnitario: Number(c.costoUnitario),
          subtotal: Number(c.subtotal),
        })),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al registrar artículo:", error);
    return NextResponse.json(
      { error: "Error en el servidor al guardar el artículo: " + error.message },
      { status: 500 }
    );
  }
}
