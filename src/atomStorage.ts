import { atom } from 'jotai'
import * as THREE from 'three'

export const ringModelAtom = atom(new THREE.Object3D());