import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Particles = ({ count = 150 }) => {
  const points = useRef();
  
  // Create random geometry for particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const position = [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ];
      const rotationSpeed = [
        Math.random() * 0.02,
        Math.random() * 0.02,
        Math.random() * 0.02
      ];
      const shapeType = Math.floor(Math.random() * 3); // 0: box, 1: sphere, 2: pyramid
      temp.push({ position, rotationSpeed, shapeType });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {particles.map((p, i) => (
        <Shape 
          key={i} 
          position={p.position} 
          rotationSpeed={p.rotationSpeed} 
          shapeType={p.shapeType} 
        />
      ))}
    </group>
  );
};

const Shape = ({ position, rotationSpeed, shapeType }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x += rotationSpeed[0];
      mesh.current.rotation.y += rotationSpeed[1];
      mesh.current.rotation.z += rotationSpeed[2];
      
      // Floating motion
      mesh.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      {shapeType === 0 && <boxGeometry args={[0.2, 0.2, 0.2]} />}
      {shapeType === 1 && <sphereGeometry args={[0.1, 16, 16]} />}
      {shapeType === 2 && <tetrahedronGeometry args={[0.2]} />}
      <meshStandardMaterial 
        color="#4A0E0E" 
        emissive="#5C1A1A" 
        emissiveIntensity={0.5} 
        transparent 
        opacity={0.6} 
      />
    </mesh>
  );
};

const ConnectionLines = ({ count = 100 }) => {
  const points = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push(new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ));
    }
    return temp;
  }, [count]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <lineSegments>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial attach="material" color="#4A0E0E" transparent opacity={0.1} />
    </lineSegments>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-black-900 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4A0E0E" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#5C1A1A" />
        
        <Particles count={window.innerWidth < 768 ? 50 : 150} />
        
        <fog attach="fog" args={['#0A0A0A', 5, 25]} />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
