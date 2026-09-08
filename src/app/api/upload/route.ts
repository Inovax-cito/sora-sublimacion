import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Tamaño máximo permitido: 15 MB
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/jfif",
  "image/png",
  "image/x-png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo de imagen" },
        { status: 400 }
      );
    }

    // Validación de peso máximo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo supera el tamaño máximo permitido (${MAX_FILE_SIZE / (1024 * 1024)}MB)` },
        { status: 400 }
      );
    }

    // Validación de tipo MIME y extensión del archivo
    const rawExt = path.extname(file.name || "").toLowerCase();
    const validExtensions = [".jpg", ".jpeg", ".jfif", ".png", ".webp", ".gif", ".svg", ".avif", ".bmp"];
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type?.toLowerCase()) || (file.type && file.type.startsWith("image/"));
    const isExtValid = validExtensions.includes(rawExt);

    if (!isMimeValid && !isExtValid) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo se aceptan imágenes (JPG, PNG, WEBP, GIF, SVG, AVIF)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = rawExt || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");
    const uniqueName = `${crypto.randomUUID()}${extension}`;

    // 1. Intentar almacenamiento en disco local (desarrollo local / servidor dedicado)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: file.name,
      });
    } catch (fsError: any) {
      // 2. Si el sistema de archivos es de solo lectura (como Vercel Serverless EROFS),
      // generamos un Data URL Base64 nativo compatible con la base de datos y la web.
      console.warn(
        "Aviso: Almacenamiento en disco no disponible (sistema de archivos de solo lectura en Vercel/Serverless). Generando Data URL Base64:",
        fsError.message
      );

      const mimeType = file.type || (rawExt === ".png" ? "image/png" : rawExt === ".webp" ? "image/webp" : "image/jpeg");
      const base64Url = `data:${mimeType};base64,${buffer.toString("base64")}`;

      return NextResponse.json({
        success: true,
        url: base64Url,
        fileName: file.name,
        source: "base64",
      });
    }
  } catch (error: any) {
    console.error("Error al procesar la subida de imagen:", error);
    return NextResponse.json(
      {
        error: `Error al procesar la imagen: ${error?.message || "Error interno del servidor"}`,
      },
      { status: 500 }
    );
  }
}
