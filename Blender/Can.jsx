/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 can.gltf -k 
*/

import React from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Model(props) {
  const group = React.useRef()
  const { nodes, materials, animations } = useGLTF('/can.gltf')
  const { actions } = useAnimations(animations, group)
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Empty" position={[0, 0.099, -0.002]} scale={0.017} />
        <group name="Empty001" position={[-0.002, 0.06, 0.005]} rotation={[Math.PI / 2, 0, 0]} scale={0.057} />
        <mesh name="Tab" geometry={nodes.Tab.geometry} material={materials['Tin.001']} position={[-0.009, 0.097, -0.031]} />
        <mesh name="Opening" geometry={nodes.Opening.geometry} material={materials['Tin.001']} position={[-0.009, 0.097, -0.031]} />
        <group name="Can" position={[-0.009, 0.097, -0.031]}>
          <mesh name="Cylinder" geometry={nodes.Cylinder.geometry} material={materials['Label.001']} morphTargetDictionary={nodes.Cylinder.morphTargetDictionary} morphTargetInfluences={nodes.Cylinder.morphTargetInfluences} />
          <mesh name="Cylinder_1" geometry={nodes.Cylinder_1.geometry} material={materials['Tin.001']} morphTargetDictionary={nodes.Cylinder_1.morphTargetDictionary} morphTargetInfluences={nodes.Cylinder_1.morphTargetInfluences} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/can.gltf')
