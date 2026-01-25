import { prisma } from "../db/prisma";

export const usePrisma = () => {
  return prisma;
};
