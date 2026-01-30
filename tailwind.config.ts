import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        
        brand: "#6366f1", // สีม่วง Indigo ดูทันสมัย
        safety: "#10b981", // สีเขียวสื่อถึงความปลอดภัยจาก AI
      },
    },
  },
  plugins: [],
};
export default config;