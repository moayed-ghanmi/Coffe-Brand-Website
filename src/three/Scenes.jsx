import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer, PerspectiveCamera, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { BeanField, CoffeeBag, CoffeeCup } from './Models'

export function StudioLights({ accent = '#d9a066' }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
      <pointLight position={[-3, 1, 2]} intensity={14} color={accent} distance={8} />
      <Environment resolution={128}>
        <Lightformer intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer intensity={2} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer intensity={1.5} color={accent} position={[5, 0, 0]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} />
      </Environment>
    </>
  )
}

export function HeroScene() {
  const group = useRef()
  useFrame(({ pointer }) => {
    const g = group.current
    if (!g) return
    // Scroll drives a spin + drop; pointer adds a subtle parallax tilt.
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.5)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.5 + scroll * Math.PI, 0.06)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.15 + 0.15 + scroll * 0.3, 0.06)
    g.position.y = THREE.MathUtils.lerp(g.position.y, -0.75 - scroll * 0.8, 0.08)
  })
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 7.2]} fov={38} />
      <StudioLights />
      <group ref={group}>
        <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
          <CoffeeCup scale={1.25} />
        </Float>
        <BeanField count={24} />
      </group>
      <Sparkles count={30} scale={[6, 5, 4]} size={2.2} speed={0.35} color="#f1c58f" opacity={0.5} />
      <ContactShadows position={[0, -1.7, 0]} opacity={0.55} scale={8} blur={2.6} far={3} frames={1} resolution={256} />
    </>
  )
}

export function BagScene({ product, hovered, distance = 4.2 }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, distance]} fov={35} />
      <StudioLights accent={product.color === '#2a1810' ? '#d9a066' : product.color} />
      <CoffeeBag product={product} hovered={hovered} />
      <ContactShadows position={[0, -1.15, 0]} opacity={0.5} scale={4} blur={2.4} far={2} frames={1} resolution={256} />
    </>
  )
}
