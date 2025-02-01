import { defineConfig, type ConfigEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }: ConfigEnv): Promise<UserConfig> => {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

  // Only load lovable-tagger in development mode
  if (mode === 'development') {
    const { componentTagger } = await import('lovable-tagger');
    return {
      server: {
        host: "::",
        port,
      },
      plugins: [
        react(),
        componentTagger(),
      ],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
    };
  }

  // Production config without lovable-tagger
  return {
    server: {
      host: "::",
      port,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
