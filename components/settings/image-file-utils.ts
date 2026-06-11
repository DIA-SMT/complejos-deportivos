"use client"

type ImageDataUrlOptions = {
    maxSize?: number
    quality?: number
}

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result)
            } else {
                reject(new Error("No se pudo leer la imagen"))
            }
        }
        reader.onerror = () => reject(new Error("No se pudo leer la imagen"))
        reader.readAsDataURL(file)
    })
}

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("No se pudo procesar la imagen"))
        image.src = src
    })
}

export async function imageFileToCompactDataUrl(file: File, options: ImageDataUrlOptions = {}) {
    const maxSize = options.maxSize ?? 512
    const quality = options.quality ?? 0.82

    if (file.type === "image/svg+xml") {
        return readFileAsDataUrl(file)
    }

    const originalDataUrl = await readFileAsDataUrl(file)
    const image = await loadImage(originalDataUrl)
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) {
        return originalDataUrl
    }

    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    return canvas.toDataURL("image/webp", quality)
}
