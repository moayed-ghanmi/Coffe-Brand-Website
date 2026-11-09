import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/* ---------- Coffee bean (sphere with a pressed-in crease) ---------- */
function makeBeanGeometry() {
  const g = new THREE.SphereGeometry(1, 28, 20)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    if (z > 0) p.setZ(i, z - 0.45 * Math.exp(-(x * x) / 0.012) * z)
  }
  g.scale(0.62, 1, 0.45)
  g.computeVertexNormals()
  return g
}

export function BeanField({ count = 26, radius = 2.4, scale = 0.11, spread = 1.6 }) {
  const ref = useRef()
  const geometry = useMemo(() => makeBeanGeometry(), [])
  const beans = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        r: radius + (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * 2.4,
        speed: 0.12 + Math.random() * 0.18,
        spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(1.5),
        s: scale * (0.75 + Math.random() * 0.5),
        phase: Math.random() * Math.PI * 2,
      })),
    [count, radius, scale, spread],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    beans.forEach((b, i) => {
      const a = b.angle + t * b.speed
      dummy.position.set(Math.cos(a) * b.r, b.y + Math.sin(t * 0.8 + b.phase) * 0.18, Math.sin(a) * b.r)
      dummy.rotation.set(t * b.spin.x, t * b.spin.y, t * b.spin.z)
      dummy.scale.setScalar(b.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]} castShadow>
      <meshPhysicalMaterial color="#4a2a17" roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.4} />
    </instancedMesh>
  )
}

/* ---------- Steam: soft sprites rising and fading ---------- */
function useSteamTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
}

function Steam({ count = 16 }) {
  const tex = useSteamTexture()
  const refs = useRef([])
  const puffs = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ offset: i / count, x: (Math.random() - 0.5) * 0.4, z: (Math.random() - 0.5) * 0.4 })),
    [count],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.22
    puffs.forEach((p, i) => {
      const s = refs.current[i]
      if (!s) return
      const life = (t + p.offset) % 1
      s.position.set(p.x + Math.sin(life * 6 + i) * 0.15, 1.05 + life * 1.8, p.z)
      s.scale.setScalar(0.25 + life * 0.9)
      s.material.opacity = Math.sin(life * Math.PI) * 0.35
    })
  })
  return puffs.map((_, i) => (
    <sprite key={i} ref={(el) => (refs.current[i] = el)}>
      <spriteMaterial map={tex} transparent depthWrite={false} opacity={0} />
    </sprite>
  ))
}

/* ---------- Cup ---------- */
export function CoffeeCup(props) {
  const lathe = useMemo(() => {
    const pts = [
      [0, 0], [0.55, 0], [0.6, 0.04], [0.76, 1.0], [0.78, 1.05], [0.73, 1.06],
      [0.7, 1.0], [0.53, 0.12], [0, 0.12],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 96)
  }, [])

  return (
    <group {...props}>
      <mesh geometry={lathe} castShadow receiveShadow>
        <meshPhysicalMaterial color="#121212" roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* brand ring */}
      <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.705, 0.018, 16, 96]} />
        <meshStandardMaterial color="#d4ff3a" emissive="#d4ff3a" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* coffee + crema */}
      <mesh position={[0, 0.93, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.67, 64]} />
        <meshPhysicalMaterial color="#3a2012" roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.932, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.67, 64]} />
        <meshStandardMaterial color="#9a6236" roughness={0.6} transparent opacity={0.7} />
      </mesh>
      {/* handle */}
      <mesh position={[0.74, 0.55, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <torusGeometry args={[0.24, 0.065, 20, 48, Math.PI]} />
        <meshPhysicalMaterial color="#121212" roughness={0.25} clearcoat={1} />
      </mesh>
      {/* saucer */}
      <mesh position={[0, -0.03, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.15, 0.8, 0.07, 96]} />
        <meshPhysicalMaterial color="#1b1b1b" roughness={0.3} clearcoat={1} />
      </mesh>
      <Steam />
    </group>
  )
}

/* ---------- Coffee bag with a canvas-drawn label ---------- */
function useLabelTexture(product) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 720
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [])

  useEffect(() => {
    const draw = () => {
      const c = tex.image
      const ctx = c.getContext('2d')
      const { color, ink, name, origin, roast, notes } = product
      ctx.fillStyle = color
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.fillStyle = ink
      ctx.font = '900 70px Unbounded, Arial Black, sans-serif'
      ctx.fillText('VOLTA', 40, 110)
      ctx.font = '600 22px Inter, sans-serif'
      ctx.fillText('SPECIALTY COFFEE · EST. 2026', 42, 150)
      ctx.fillRect(40, 180, c.width - 80, 4)
      // big lightning "V" mark
      ctx.beginPath()
      ctx.moveTo(120, 240)
      ctx.lineTo(256, 470)
      ctx.lineTo(392, 240)
      ctx.lineWidth = 46
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = ink
      ctx.stroke()
      ctx.font = '700 46px Unbounded, Arial Black, sans-serif'
      ctx.fillText(name.toUpperCase(), 40, 570)
      ctx.font = '600 24px Inter, sans-serif'
      ctx.fillText(`${origin.toUpperCase()}  ·  ${roast.toUpperCase()} ROAST`, 42, 612)
      ctx.font = '500 22px Inter, sans-serif'
      ctx.fillText(notes.join(' / '), 42, 650)
      ctx.fillText('250 G', c.width - 110, 690)
      tex.needsUpdate = true
    }
    draw()
    document.fonts?.ready.then(draw)
  }, [product, tex])

  return tex
}

export function CoffeeBag({ product, hovered = false, spin = true, ...props }) {
  const ref = useRef()
  const label = useLabelTexture(product)
  const bagColor = product.color === '#1d1d1f' ? '#1d1d1f' : '#0e0e0e'

  useFrame((state, dt) => {
    if (!ref.current) return
    const target = hovered ? 1.08 : 1
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1)
    if (spin) ref.current.rotation.y += dt * (hovered ? 1.6 : 0.35)
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.06
  })

  return (
    <group {...props}>
      <group ref={ref}>
        <RoundedBox args={[1.25, 1.8, 0.55]} radius={0.1} smoothness={5} castShadow>
          <meshPhysicalMaterial color={bagColor} roughness={0.55} clearcoat={0.4} />
        </RoundedBox>
        {/* crimped top seal */}
        <mesh position={[0, 0.94, 0]}>
          <boxGeometry args={[1.27, 0.14, 0.12]} />
          <meshStandardMaterial color={product.color} roughness={0.5} />
        </mesh>
        {/* labels */}
        <mesh position={[0, -0.03, 0.276]}>
          <planeGeometry args={[1.05, 1.48]} />
          <meshStandardMaterial map={label} roughness={0.45} />
        </mesh>
        <mesh position={[0, -0.03, -0.276]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.05, 1.48]} />
          <meshStandardMaterial map={label} roughness={0.45} />
        </mesh>
        {/* degassing valve */}
        <mesh position={[0.38, 0.72, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 24]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}
