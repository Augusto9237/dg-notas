import { PrismaClient } from '@/app/generated/prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Configuração recomendada para o Neon em Edge/Serverless
neonConfig.webSocketConstructor = globalThis.WebSocket;

const prismaClientSingleton = () => {
  // O Driver Adapter do Neon exige a URL direta do banco (postgres://) e NÃO a URL do Accelerate (prisma://)
  const connectionString = process.env.DB_DG_REDACAO_DATABASE_URL!;
  
  // No Prisma 6+, o PrismaNeon aceita o objeto de configuração do Pool diretamente
  const adapter = new PrismaNeon({ connectionString });
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
