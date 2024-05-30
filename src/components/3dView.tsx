import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useRef } from "react";

function Model({rotation}: {rotation: {x: number, y: number, z: number}}) {
    // const gltf = useGLTF("/body.glb");
    
    

    function Lights({position}: {position: [number, number, number]}) {
        const light = useRef(null)
        return <spotLight ref={light} intensity={20000} position={position} shadow-mapSize-width={64} shadow-mapSize-height={64} castShadow shadow-bias={-0.001} />
    }

    return (
        <div className="canvas h-auto p-2 rounded-md text-white font-bold font-mono outline w-[95%]">
            3D View 
            {/* <Canvas
                style={{  height: (window.innerHeight / 3)*2, position: "relative" }}
                dpr={Math.min(window.devicePixelRatio, 2)}
            >
                <OrbitControls
                    enablePan={false}
                    enableRotate={false}
                    enableZoom={false}
                />
                <PerspectiveCamera
                    makeDefault
                    zoom={0.4}
                    near={1}
                    far={2000}
                    position={[0, 0, 200]}
                />
                <primitive
                    object={gltf.scene}
                    rotation={[(6.26/360)*rotation.x,(6.26/360)*-(rotation.y),(6.26/360)*rotation.z]}
                />
                <Lights position={[-100, 100, 100]}/>
                <Lights position={[100, -100, -100]}/>
            </Canvas> */}
        </div>
    );
}

export default Model;
