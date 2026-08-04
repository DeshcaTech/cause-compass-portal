import type { ImgHTMLAttributes } from "react";

type PictureProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** AVIF source (smallest, modern browsers). */
  avif?: string;
  /** WebP source (broad support fallback). */
  webp?: string;
  /** Original raster fallback (JPEG/PNG). */
  src: string;
  alt: string;
  /** Class applied to the <picture> wrapper. */
  pictureClassName?: string;
};

/**
 * Renders an image with AVIF -> WebP -> original fallback chain.
 * The browser picks the first format it supports.
 */
export function Picture({ avif, webp, src, alt, pictureClassName, ...imgProps }: PictureProps) {
  return (
    <picture className={pictureClassName}>
      {avif ? <source srcSet={avif} type="image/avif" /> : null}
      {webp ? <source srcSet={webp} type="image/webp" /> : null}
      <img src={src} alt={alt} {...imgProps} />
    </picture>
  );
}
