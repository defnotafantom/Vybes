TypeScript
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Indica a Prisma Migrate dove trovare la stringa di connessione
    url: process.env.DATABASE_URL, 
  },
});
