import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useRef } from "react";

function Model({rotation}) {
    const gltf = useGLTF("/cube.glb");
    
    

    function Lights({position}) {
        const light = useRef()
        return <spotLight ref={light} intensity={20000} position={position} shadow-mapSize-width={64} shadow-mapSize-height={64} castShadow shadow-bias={-0.001} />
    }

    return (
        <div className="canvas border w-auto h-auto p-2 rounded-md text-white font-bold">
            3D View
            <Canvas
                style={{ width: 460, height: window.innerHeight / 3, position: "relative" }}
                dpr={Math.min(window.devicePixelRatio, 2)}
            >
                <OrbitControls
                    enablePan={false}
                    enableRotate={false}
                />
                <PerspectiveCamera
                    makeDefault
                    zoom={1}
                    top={200}
                    bottom={-200}
                    left={200}
                    right={-200}
                    near={1}
                    far={2000}
                    position={[0, 0, 200]}
                />
                <primitive
                    object={gltf.scene}
                    rotation={[(6.26/360)*rotation.y,(6.26/360)*-rotation.x,(6.26/360)*-rotation.z]}
                />
                <Lights position={[-100, 100, 100]}/>
                <Lights position={[100, -100, -100]}/>
            </Canvas>
        </div>
    );
}
// useGLTF.preload("/me.glb");

export default Model;
