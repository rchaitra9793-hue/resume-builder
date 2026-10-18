// Image helpers for the profile photo (all run in the browser, free, no API key)

const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read this image'))
    img.src = src
})

const blobToDataUrl = (blob) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
})

// Shrinks a photo so it stays small when saved to the database
export const resizeImage = async (file, maxSize = 600) => {
    const url = URL.createObjectURL(file)
    try {
        const img = await loadImage(url)
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/jpeg', 0.9)
    } finally {
        URL.revokeObjectURL(url)
    }
}

// Crops a transparent cut-out into a square with the person centered (head near the top)
const centerSubject = async (src, outputSize = 400) => {
    const img = await loadImage(src)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, img.width, img.height)

    // Bounding box of visible (non-transparent) pixels
    let minX = img.width, minY = img.height, maxX = -1, maxY = -1
    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            if (data[(y * img.width + x) * 4 + 3] > 25) {
                if (x < minX) minX = x
                if (x > maxX) maxX = x
                if (y < minY) minY = y
                if (y > maxY) maxY = y
            }
        }
    }
    if (maxX < 0) throw new Error('No person was found in this photo')

    const boxW = maxX - minX + 1
    const boxH = maxY - minY + 1

    // Horizontal center of the head (top quarter of the subject), so leaning shoulders don't shift the crop
    let headMin = img.width, headMax = -1
    for (let y = minY; y < minY + boxH * 0.25; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (data[(y * img.width + x) * 4 + 3] > 25) {
                if (x < headMin) headMin = x
                if (x > headMax) headMax = x
            }
        }
    }
    const centerX = headMax >= 0 ? (headMin + headMax) / 2 : minX + boxW / 2

    let side, sy
    if (maxY >= img.height - 3) {
        // Portrait cut off at the bottom (head and shoulders): fill the frame, shoulders at the bottom edge
        side = Math.max(boxH / 0.9, boxW * 0.75)
        sy = maxY + 1 - side
    } else {
        // Whole person visible: fit them with some breathing room
        side = Math.max(boxW, boxH) * 1.15
        sy = minY - side * 0.07
    }
    const sx = centerX - side / 2

    const out = document.createElement('canvas')
    out.width = outputSize
    out.height = outputSize
    out.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, outputSize, outputSize)
    return out.toDataURL('image/png')
}

const hasWebGpu = async () => {
    try {
        return !!(navigator.gpu && await navigator.gpu.requestAdapter())
    } catch {
        return false
    }
}

// Removes the background with an AI model that runs locally in the browser.
// Uses the graphics card (WebGPU) when available, otherwise the small quantized model on the CPU.
// The model is downloaded once on first use and then cached by the browser.
export const removeImageBackground = async (src, onProgress) => {
    const { removeBackground } = await import('@imgly/background-removal')
    // The model works at 1024px internally, so a smaller input only saves decoding time
    const input = await resizeDataUrl(src, 1024)

    const run = (device) => removeBackground(input, {
        device,
        model: device === 'gpu' ? 'isnet_fp16' : 'isnet_quint8',
        output: { format: 'image/png' },
        progress: (key, current, total) => {
            if (!onProgress || !total) return
            if (key.startsWith('fetch')) onProgress({ stage: 'download', percent: Math.round((current / total) * 100) })
            else if (key.startsWith('compute')) onProgress({ stage: 'compute', percent: Math.round((current / total) * 100) })
        },
    })

    let blob
    if (await hasWebGpu()) {
        try {
            blob = await run('gpu')
        } catch (error) {
            console.warn('WebGPU background removal failed, falling back to CPU', error)
        }
    }
    if (!blob) blob = await run('cpu')
    return centerSubject(await blobToDataUrl(blob))
}

const resizeDataUrl = async (src, maxSize) => {
    const img = await loadImage(src)
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
    if (scale === 1) return src
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
}
