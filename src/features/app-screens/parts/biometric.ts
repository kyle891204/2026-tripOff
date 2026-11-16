/**
 * 기기 생체 인식 (Face ID · Touch ID · Windows Hello · 안드로이드 지문) — 브라우저 표준 WebAuthn 사용.
 * 시연이라 서버 검증 없이, 기기가 본인 확인(userVerification)을 통과시켰는지만 본다.
 * 생체 인식을 쓸 수 없는 기기에서는 화면이 시연용 인식으로 대신한다.
 */

const toB64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
const random = (n: number) => crypto.getRandomValues(new Uint8Array(n))

export async function biometricAvailable(): Promise<boolean> {
  try {
    return !!window.PublicKeyCredential && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
  } catch {
    return false
  }
}

/** 이 기기의 생체 인식으로 등록 → 저장할 credential id */
export async function enrollBiometric(): Promise<string> {
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: random(32),
      rp: { name: 'TripOff 시연' },
      user: { id: random(16), name: 'tripoff-demo', displayName: 'TripOff 시연 계정' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
      attestation: 'none',
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null
  if (!cred) throw new Error('cancelled')
  return toB64(cred.rawId)
}

/** 등록한 생체 인식으로 본인 확인 (실패·취소 시 throw) */
export async function verifyBiometric(credentialId: string): Promise<void> {
  const res = await navigator.credentials.get({
    publicKey: {
      challenge: random(32),
      allowCredentials: [{ type: 'public-key', id: fromB64(credentialId) }],
      userVerification: 'required',
      timeout: 60_000,
    },
  })
  if (!res) throw new Error('cancelled')
}
