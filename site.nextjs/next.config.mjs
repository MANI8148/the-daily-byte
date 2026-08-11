/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-rendered (default): enables the /api/gemini publishing desk.
  // For pure static hosting run `npm run build` then export the standalone
  // output, or use scripts/render.py -> _site/ instead.
  reactStrictMode: true,
};

export default nextConfig;