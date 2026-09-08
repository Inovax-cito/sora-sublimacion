import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed en la base de datos oficial 'sora_sublimacion'...");

  // Meta financiera por defecto
  await prisma.configuracion.upsert({
    where: { clave: "meta_ganancia" },
    update: {},
    create: {
      clave: "meta_ganancia",
      valor: "1000000", // $1.000.000 de meta
    },
  });

  // Artículos Individuales
  const articulosDemo = [
    {
      codigo: "TAZ-001",
      nombre: "Taza Cerámica Blanca Sublimada",
      categoria: "Tazas",
      descripcion: "Taza de cerámica premium AAA de 325ml con estampado full color resistente a microondas.",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: 1800.0,
      precioVenta: 4200.0,
      stockActual: 30,
      stockMinimo: 5,
      esCombo: false,
    },
    {
      codigo: "TAZ-002",
      nombre: "Taza Mágica Termosensible",
      categoria: "Tazas",
      descripcion: "Revela la imagen personalizada al verter líquidos calientes. Acabado mate elegante.",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: 2500.0,
      precioVenta: 5600.0,
      stockActual: 18,
      stockMinimo: 4,
      esCombo: false,
    },
    {
      codigo: "REM-001",
      nombre: "Remera Spun Tacto Algodón Sublimada",
      categoria: "Textil",
      descripcion: "Remera unisex tela premium spun con acabado ultra suave y estampado indeleble de alta fidelidad.",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: 3400.0,
      precioVenta: 8200.0,
      stockActual: 45,
      stockMinimo: 10,
      esCombo: false,
    },
    {
      codigo: "GOR-001",
      nombre: "Gorra Trucker Frente Blanco",
      categoria: "Gorras",
      descripcion: "Gorra trucker con red regulable, panel frontal acolchado especial para sublimación.",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: 1900.0,
      precioVenta: 4500.0,
      stockActual: 22,
      stockMinimo: 6,
      esCombo: false,
    },
    {
      codigo: "BOT-001",
      nombre: "Botella Deportiva Aluminio 600ml",
      categoria: "Botellas",
      descripcion: "Botella liviana de aluminio con mosquetón y pico vertedor antiderrame.",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: 3900.0,
      precioVenta: 8900.0,
      stockActual: 14,
      stockMinimo: 5,
      esCombo: false,
    },
    {
      codigo: "MOU-001",
      nombre: "Mousepad Gamer Sublimado 30x25",
      categoria: "Accesorios",
      descripcion: "Superficie de tela speed de baja fricción y base antideslizante texturada.",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: 1600.0,
      precioVenta: 3800.0,
      stockActual: 28,
      stockMinimo: 5,
      esCombo: false,
    },
  ];

  for (const art of articulosDemo) {
    await prisma.articulo.upsert({
      where: { codigo: art.codigo },
      update: {},
      create: art,
    });
  }

  // Combos / Boxes con artefactos y desglose
  const comboCumple = await prisma.articulo.upsert({
    where: { codigo: "BOX-001" },
    update: {},
    create: {
      codigo: "BOX-001",
      nombre: "Box Regalo Cumpleaños Especial",
      categoria: "Boxes & Combos",
      descripcion: "Caja de regalo decorada con taza sublimada personalizada, popurrí perfumado y tarjeta dedicatoria.",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: 3550.0, // Suma de todos los artefactos
      precioVenta: 8900.0,  // Precio final al cliente
      stockActual: 15,
      stockMinimo: 3,
      esCombo: true,
      componentes: {
        create: [
          { nombre: "Caja Kraft con visor transparente", costoUnitario: 550.0, cantidad: 1, subtotal: 550.0 },
          { nombre: "Viruta Popurrí aromático decorativo", costoUnitario: 250.0, cantidad: 1, subtotal: 250.0 },
          { nombre: "Taza Cerámica Sublimada Full Color", costoUnitario: 2500.0, cantidad: 1, subtotal: 2500.0 },
          { nombre: "Tarjeta mensaje personalizada 300g", costoUnitario: 150.0, cantidad: 1, subtotal: 150.0 },
          { nombre: "Moño y cinta de raso borgoña", costoUnitario: 100.0, cantidad: 1, subtotal: 100.0 },
        ],
      },
    },
  });

  const comboGamer = await prisma.articulo.upsert({
    where: { codigo: "BOX-002" },
    update: {},
    create: {
      codigo: "BOX-002",
      nombre: "Combo Pack Gamer (Remera + Mousepad + Taza)",
      categoria: "Boxes & Combos",
      descripcion: "Pack completo para gamers con remera sublimada, mousepad extendido y taza temática en bolsa eco.",
      imagenUrl: "/logo-sora.jpeg",
      precioCompra: 7100.0,
      precioVenta: 16500.0,
      stockActual: 10,
      stockMinimo: 2,
      esCombo: true,
      componentes: {
        create: [
          { nombre: "Remera Spun Estampada Gamer", costoUnitario: 3400.0, cantidad: 1, subtotal: 3400.0 },
          { nombre: "Mousepad Gamer Sublimado 30x25", costoUnitario: 1600.0, cantidad: 1, subtotal: 1600.0 },
          { nombre: "Taza Mágica Temática", costoUnitario: 1800.0, cantidad: 1, subtotal: 1800.0 },
          { nombre: "Bolsa ecológica de tela Sora", costoUnitario: 300.0, cantidad: 1, subtotal: 300.0 },
        ],
      },
    },
  });

  console.log("¡Base de datos 'sora_sublimacion' sembrada con éxito con artículos simples y combos!");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
