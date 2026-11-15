const dbName = 'tripoff-voucher-files'
const storeName = 'files'

function openFiles(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function fileRecord(id: string, file?: File): Promise<File | undefined> {
  const db = await openFiles()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, file ? 'readwrite' : 'readonly')
      const store = tx.objectStore(storeName)
      const req = file ? store.put(file, id) : store.get(id)
      tx.oncomplete = () => resolve(file ?? req.result)
      tx.onabort = tx.onerror = () => reject(tx.error)
    })
  } finally { db.close() }
}

type QRDetector = new (options: { formats: string[] }) => { detect(source: ImageBitmap): Promise<Array<{ rawValue: string }>> }

export async function detectImageQr(file: File) {
  const Detector = (globalThis as typeof globalThis & { BarcodeDetector?: QRDetector }).BarcodeDetector
  if (!Detector || !file.type.startsWith('image/')) return undefined
  try {
    const bitmap = await createImageBitmap(file)
    try { return (await new Detector({ formats: ['qr_code'] }).detect(bitmap))[0]?.rawValue }
    finally { bitmap.close() }
  } catch { return undefined }
}
