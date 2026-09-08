import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const config = await prisma.configuracion.findUnique({
      where: { clave: "meta_ganancia" },
    });

    const meta = config ? parseFloat(config.valor) || 1000000 : 1000000;

    return NextResponse.json({ meta });
  } catch (error: any) {
    console.error("Error al consultar la meta financiera:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const nuevaMeta = parseFloat(body.meta);

    if (isNaN(nuevaMeta) || nuevaMeta <= 0) {
      return NextResponse.json(
        { error: "La meta debe ser un valor monetario positivo mayor a cero" },
        { status: 400 }
      );
    }

    const config = await prisma.configuracion.upsert({
      where: { clave: "meta_ganancia" },
      update: { valor: nuevaMeta.toString() },
      create: { clave: "meta_ganancia", valor: nuevaMeta.toString() },
    });

    return NextResponse.json({
      success: true,
      meta: parseFloat(config.valor),
    });
  } catch (error: any) {
    console.error("Error al actualizar la meta:", error);
    return NextResponse.json({ error: "Error en el servidor al guardar la meta" }, { status: 500 });
  }
}
