/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Penting: ini akan mengubah aplikasi jadi file statis
  images: {
    unoptimized: true, // GitHub Pages tidak mendukung optimasi gambar default Next.js
  },
}

module.exports = nextConfig