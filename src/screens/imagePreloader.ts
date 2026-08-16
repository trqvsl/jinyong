const loadedImageUrls = new Set<string>()
const pendingImages = new Map<string, Promise<void>>()

export function preloadImage(src: string): Promise<void> {
  if (!src || loadedImageUrls.has(src)) return Promise.resolve()

  const pending = pendingImages.get(src)
  if (pending) return pending

  const request = new Promise<void>((resolve) => {
    const image = new Image()
    const finish = () => {
      loadedImageUrls.add(src)
      pendingImages.delete(src)
      resolve()
    }
    image.onload = finish
    image.onerror = finish
    image.src = src
    if (image.complete) finish()
  })

  pendingImages.set(src, request)
  return request
}

export function preloadImages(srcs: string[]): Promise<void> {
  return Promise.all(Array.from(new Set(srcs)).map(preloadImage)).then(() => undefined)
}

export function isImagePreloaded(src: string): boolean {
  return loadedImageUrls.has(src)
}
