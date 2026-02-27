import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'

/* ── Low-poly Clock Tower made from primitives ── */
function ClockTower(props) {
    const group = useRef()
    const materialGreen = useMemo(() => new THREE.MeshStandardMaterial({ color: '#00843D', flatShading: true }), [])
    const materialStone = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9b896', flatShading: true }), [])
    const materialGold = useMemo(() => new THREE.MeshStandardMaterial({ color: '#D4AF37', flatShading: true, metalness: 0.6, roughness: 0.3 }), [])
    const materialWhite = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f0ede5', flatShading: true }), [])
    const materialRoof = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8B4513', flatShading: true }), [])
    const materialClock = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a2e', flatShading: true }), [])

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y += 0.003
            // Subtle mouse follow
            const t = state.pointer
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, t.y * 0.1, 0.05)
        }
    })

    return (
        <group ref={group} {...props} scale={0.6}>
            {/* Base platform */}
            <mesh position={[0, -2.5, 0]} material={materialStone}>
                <cylinderGeometry args={[3, 3.5, 1, 8]} />
            </mesh>

            {/* Steps */}
            <mesh position={[0, -1.85, 0]} material={materialWhite}>
                <cylinderGeometry args={[2.5, 3, 0.3, 8]} />
            </mesh>

            {/* Tower base (octagonal) */}
            <mesh position={[0, 0, 0]} material={materialStone}>
                <cylinderGeometry args={[1.8, 2.2, 3.5, 8]} />
            </mesh>

            {/* Lower trim */}
            <mesh position={[0, 1.85, 0]} material={materialGold}>
                <cylinderGeometry args={[1.85, 1.8, 0.2, 8]} />
            </mesh>

            {/* Middle section */}
            <mesh position={[0, 3, 0]} material={materialWhite}>
                <cylinderGeometry args={[1.5, 1.8, 2, 8]} />
            </mesh>

            {/* Clock face front */}
            <mesh position={[0, 3.2, 1.52]} material={materialClock}>
                <circleGeometry args={[0.6, 16]} />
            </mesh>
            {/* Clock hands */}
            <mesh position={[0, 3.2, 1.54]} material={materialGold}>
                <boxGeometry args={[0.05, 0.5, 0.02]} />
            </mesh>
            <mesh position={[0, 3.2, 1.54]} rotation={[0, 0, Math.PI / 3]} material={materialGold}>
                <boxGeometry args={[0.04, 0.35, 0.02]} />
            </mesh>

            {/* Clock face back */}
            <mesh position={[0, 3.2, -1.52]} rotation={[0, Math.PI, 0]} material={materialClock}>
                <circleGeometry args={[0.6, 16]} />
            </mesh>

            {/* Upper trim */}
            <mesh position={[0, 4.1, 0]} material={materialGold}>
                <cylinderGeometry args={[1.6, 1.5, 0.2, 8]} />
            </mesh>

            {/* Upper tower */}
            <mesh position={[0, 5, 0]} material={materialStone}>
                <cylinderGeometry args={[1.1, 1.5, 1.5, 8]} />
            </mesh>

            {/* Roof */}
            <mesh position={[0, 6.2, 0]} material={materialRoof}>
                <coneGeometry args={[1.5, 1.8, 8]} />
            </mesh>

            {/* Spire */}
            <mesh position={[0, 7.6, 0]} material={materialGold}>
                <coneGeometry args={[0.2, 1.2, 8]} />
            </mesh>

            {/* Spire tip */}
            <mesh position={[0, 8.5, 0]} material={materialGold}>
                <sphereGeometry args={[0.15, 8, 8]} />
            </mesh>

            {/* Ground decorations - small pillars */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const angle = (i / 8) * Math.PI * 2
                const x = Math.cos(angle) * 2.8
                const z = Math.sin(angle) * 2.8
                return (
                    <group key={i}>
                        <mesh position={[x, -1.5, z]} material={materialWhite}>
                            <cylinderGeometry args={[0.12, 0.12, 1.5, 6]} />
                        </mesh>
                        <mesh position={[x, -0.65, z]} material={materialGold}>
                            <sphereGeometry args={[0.15, 6, 6]} />
                        </mesh>
                    </group>
                )
            })}

            {/* River suggestion - wavy plane at the base */}
            <mesh position={[0, -3.1, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materialGreen}>
                <ringGeometry args={[3.5, 6, 16]} />
            </mesh>
        </group>
    )
}

/* ── Floating particles ── */
function Particles() {
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < 50; i++) {
            temp.push({
                position: [
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                ],
                scale: Math.random() * 0.05 + 0.02,
            })
        }
        return temp
    }, [])

    return (
        <>
            {particles.map((p, i) => (
                <Float key={i} speed={1 + Math.random()} floatIntensity={2}>
                    <mesh position={p.position}>
                        <sphereGeometry args={[p.scale, 6, 6]} />
                        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} />
                    </mesh>
                </Float>
            ))}
        </>
    )
}

/* ── Main exported component ── */
export default function ClockTowerScene() {
    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 2, 12], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <fog attach="fog" args={['#0a1f12', 15, 35]} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 8, 5]} intensity={1.2} color="#fff8e7" castShadow />
                <pointLight position={[-5, 3, -5]} intensity={0.5} color="#00843D" />
                <pointLight position={[3, 6, 3]} intensity={0.3} color="#D4AF37" />

                <ClockTower position={[0, -1, 0]} />
                <Particles />
                <Stars radius={50} depth={50} count={1000} factor={3} saturation={0.5} fade speed={1} />
                <Environment preset="night" />
            </Canvas>
        </div>
    )
}
