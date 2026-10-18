export type ImageSource = string | { src: string };

export function imageSrc(image: ImageSource): string {
  return typeof image === "string" ? image : image.src;
}
