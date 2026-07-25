// vite.config.js
import { defineConfig } from "file:///C:/Users/Tadesse/Desktop/PMS%20SUPER%20AND%20THE%20OWNER/Alpha-PMS-Admin/front-end/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/Tadesse/Desktop/PMS%20SUPER%20AND%20THE%20OWNER/Alpha-PMS-Admin/front-end/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import commonjs from "file:///C:/Users/Tadesse/Desktop/PMS%20SUPER%20AND%20THE%20OWNER/Alpha-PMS-Admin/front-end/node_modules/vite-plugin-commonjs/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\Tadesse\\Desktop\\PMS SUPER AND THE OWNER\\Alpha-PMS-Admin\\front-end";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    commonjs()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 3e3,
    allowedHosts: "all"
  },
  preview: {
    host: "0.0.0.0",
    port: 3e3
  },
  optimizeDeps: {
    include: ["rtcpeerconnection-shim", "sdp"]
  },
  assetsInclude: ["**/*.PNG", "**/*.JPG", "**/*.jpeg", "**/*.gif", "**/*.svg"]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxUYWRlc3NlXFxcXERlc2t0b3BcXFxcUE1TIFNVUEVSIEFORCBUSEUgT1dORVJcXFxcQWxwaGEtUE1TLUFkbWluXFxcXGZyb250LWVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVGFkZXNzZVxcXFxEZXNrdG9wXFxcXFBNUyBTVVBFUiBBTkQgVEhFIE9XTkVSXFxcXEFscGhhLVBNUy1BZG1pblxcXFxmcm9udC1lbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1RhZGVzc2UvRGVza3RvcC9QTVMlMjBTVVBFUiUyMEFORCUyMFRIRSUyME9XTkVSL0FscGhhLVBNUy1BZG1pbi9mcm9udC1lbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGNvbW1vbmpzIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbW1vbmpzJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgY29tbW9uanMoKVxuICBdLFxuXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJylcbiAgICB9XG4gIH0sXG5cbiAgc2VydmVyOiB7XG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHBvcnQ6IDMwMDAsXG4gICAgYWxsb3dlZEhvc3RzOiAnYWxsJ1xuICB9LFxuXG4gIHByZXZpZXc6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogMzAwMFxuICB9LFxuXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsncnRjcGVlcmNvbm5lY3Rpb24tc2hpbScsICdzZHAnXVxuICB9LFxuXG4gIGFzc2V0c0luY2x1ZGU6IFsnKiovKi5QTkcnLCAnKiovKi5KUEcnLCAnKiovKi5qcGVnJywgJyoqLyouZ2lmJywgJyoqLyouc3ZnJ11cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNhLFNBQVMsb0JBQW9CO0FBQ25jLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxjQUFjO0FBSHJCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFNBQVM7QUFBQSxFQUNYO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDcEM7QUFBQSxFQUNGO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsMEJBQTBCLEtBQUs7QUFBQSxFQUMzQztBQUFBLEVBRUEsZUFBZSxDQUFDLFlBQVksWUFBWSxhQUFhLFlBQVksVUFBVTtBQUM3RSxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
