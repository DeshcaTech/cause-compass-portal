/// <reference types="vite/client" />
/// <reference types="vite-imagetools/client" />

// vite-imagetools query imports (e.g. "./hero.jpg?w=800&format=avif") resolve to a URL string.
declare module "*&format=avif" {
  const src: string;
  export default src;
}
declare module "*&format=webp" {
  const src: string;
  export default src;
}
declare module "*&format=jpg" {
  const src: string;
  export default src;
}
declare module "*&format=png" {
  const src: string;
  export default src;
}
