// lib/db.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Inicializa el cliente Prisma, reutilizando la instancia en desarrollo
export const db =
  global.prisma ||
  new PrismaClient({
    // Opcional: Puedes descomentar la siguiente línea si quieres ver las queries SQL en la consola de desarrollo
    // log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Evita crear múltiples instancias de PrismaClient en desarrollo
if (process.env.NODE_ENV !== 'production') {
  global.prisma = db
}