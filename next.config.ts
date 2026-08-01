import type { NextConfig } from "next";

/* גלריית החדרים נשמרת ב-GuestHub ומוגשת משם (/uploads/rooms/...). במקום לחשוף
   את דומיין הבק-אופיס לדפדפן, האתר מגיש אותה מאותו origin דרך rewrite ל-loopback
   — כך next/image מייעל אותה כתמונה מקומית */
const GUESTHUB = process.env.GUESTHUB_API_URL ?? "http://127.0.0.1:3007";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [{ source: "/room-images/:path*", destination: `${GUESTHUB}/uploads/rooms/:path*` }];
  },
};

export default nextConfig;
