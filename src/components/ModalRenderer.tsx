import { Modal, Image, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, ModalFooter, Tab, TabList, TabPanel, TabPanels, Tabs, Flex, HStack, FormControl, FormHelperText, FormLabel, Input, Checkbox, Stack, Hide, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/holistic';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ringModelAtom } from '../atomStorage';
import { useAtom } from 'jotai';

type Ring = {
    name: string,
    imageSrc: string,
    modelPath: string,
    description: string
}

type Props = {
    modalType: string,
    isOpen: boolean,
    onClose: () => void,
    ring: Ring
}

function ActionModal({ isOpen, onClose, ring }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<any>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [connectorsCheckbox, setConnectorsCheckbox] = useState<boolean>(true);
    const [landmarksCheckbox, setLandmarksCheckbox] = useState<boolean>(true);
    const [modelMovementCheckbox, setModelMovementCheckbox] = useState<boolean>(false);
    const connectorsCheckboxRef = useRef<HTMLInputElement>(null);
    const landmarksCheckboxRef = useRef<HTMLInputElement>(null);
    const modelMovementCheckboxRef = useRef<HTMLInputElement>(null);
    const ringSizeSliderRef = useRef<HTMLInputElement>(null);

    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
    const [modelAdded, setModelAdded] = useState<boolean>(false);
    const [model, setModel] = useAtom(ringModelAtom);
    // const [position14, setPosition14] = useState<any>({});
    // const [position13, setPosition13] = useState<any>({});
    // const [positionRingState, setPositionRingState] = useState<any>({});

    const createHandLandmarker = async () => {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
        const newHandLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
        });
        setHandLandmarker(newHandLandmarker);
    };

    const addModel = () => {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ alpha: true }); // Добавил атрибут alpha для поддержки прозрачности
        const camera = new THREE.PerspectiveCamera(20, 640 / 480, 0.1, 1000); // Инициализация объекта camera
        camera.position.z = 2;

        // canvasRef.current!.width / canvasRef.current!.height
        
        renderer.setSize(640, 480);
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = `${videoRef.current?.offsetTop}px`;
        renderer.domElement.style.left = `${videoRef.current?.offsetLeft}px`;
        renderer.domElement.width = 640;
        renderer.domElement.height = 480;
        renderer.outputColorSpace = THREE.SRGBColorSpace; // Добавил атрибут для корректного отображения цветов

        overlayRef.current!.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF);
        ambientLight.intensity = 2;
        scene.add(ambientLight);

        const loader = new GLTFLoader();
        loader.load(
            ring.modelPath,

            function (gltf) {
                const loadedModel = gltf.scene;
                loadedModel.scale.set(0, 0, 0);
                loadedModel.name = 'Ring';
                scene.add(loadedModel);
                setModel(loadedModel); // Использование локального состояния model вместо переменной model
            },
            undefined,

            function (error) {
                console.error('An error happened', error);
            }
        );

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    };

    const predictWebcam = () => {
        if (!webcamRunning) return;
        // console.log(new Date().getTime());

        const video = videoRef.current;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement?.getContext("2d");

        if (!canvasElement || !canvasCtx || !handLandmarker || !webcamRunning || !video) {
            if (canvasCtx) {
                canvasCtx.clearRect(0, 0, canvasElement?.width || 0, canvasElement?.height || 0);
            }
            setModelAdded(false);
            console.log("HandLandmarker is not loaded or webcam is not running.");
            return;
        }

        canvasElement.width = videoRef.current?.videoWidth || 0;
        canvasElement.height = videoRef.current?.videoHeight || 0;
        canvasElement.style.left = `${videoRef.current?.offsetLeft}px`;
        canvasElement.style.top = `${videoRef.current?.offsetTop}px`;

        // const currentTime = videoRef.current?.currentTime || 0;
        let results = null;
        if (videoRef.current.readyState >= HTMLMediaElement.HAVE_METADATA) {
            results = handLandmarker.detectForVideo(videoRef.current!, performance.now());
        }

        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // console.log(results);

        if (results && results.landmarks) {
            // console.log(connectorsCheckbox);

            for (let landmarks of results.landmarks) {
                landmarks = landmarks.map(landmark => {
                    landmark.visibility = 1;
                    return landmark;
                })

                if (connectorsCheckboxRef.current?.checked) {
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                        color: "#FFFFFF",
                        lineWidth: 5
                    });
                }
                if (landmarksCheckboxRef.current?.checked) {
                    drawLandmarks(canvasCtx, landmarks, {
                        color: "#00BFFF",
                        lineWidth: 2
                    });
                }
            }

            if (results.landmarks.length !== 0) {
                setModelAdded(true); // Если модель еще не добавлена и есть landmarks, установим modelAdded в true

                let position14: any = {};
                let position13: any = {};
                let positionRing: any = {};
                
                //// Приведение к общей системе координат
                //// Для 0 14
                position14.x = (results.landmarks[0][14].x) * 2 - 1; // Преобразование x в диапазон [-1, 1]
                position14.y = (1 - results.landmarks[0][14].y) * 2 - 1; // Преобразование y в диапазон [-1, 1]
                position14.z = -1; // Без Z позиция не копируется
                //// Для 0 13
                position13.x = (results.landmarks[0][13].x) * 2 - 1; // Преобразование x в диапазон [-1, 1]
                position13.y = (1 - results.landmarks[0][13].y) * 2 - 1; // Преобразование y в диапазон [-1, 1]
                //// Для кольца
                positionRing.x = position14.x;
                if (modelMovementCheckboxRef.current?.checked) positionRing.y = model.position.y;
                else positionRing.y = position14.y;
                positionRing.z = position14.z;
                ////

                // let sliderValue = parseInt(ringSizeSliderRef.current?.value || "0") * 2 / 100;
                let newScale = results.landmarks[0][0].z * 70000 /** sliderValue*/;
                //let newScale = results.landmarks[0][0].z * 50000;
                //ringSizeTextBoxRef.current?.value = newScale;
                model.scale.set(newScale, newScale, newScale);

                // Вычисляем угол между горизонтальной прямой и прямой, образованной точками results.landmarks[0][13] и results.landmarks[0][14]
                let deltaY = position13.y - position14.y;
                let deltaX = position13.x - position14.x;
                let angle = Math.atan2(deltaY, deltaX);

                // Преобразуем радианы в градусы и вращаем модель по оси Z
                let degrees = (angle * 180 / Math.PI + 360) % 360;
                // console.log(degrees);

                setModel(prevModel => {
                    const updatedModel = Object.assign({}, prevModel); // Создаем копию предыдущего объекта model
                    updatedModel.position.set(positionRing.x, positionRing.y, positionRing.z);
                    updatedModel.scale.set(newScale, newScale, newScale); // Устанавливаем новые координаты позиции
                    updatedModel.rotation.z = (degrees * Math.PI / 180) + 80; // Устанавливаем новые координаты позиции. Пока сам понятия не имею почему именно + 80, но пусть будет
                    return updatedModel; // Возвращаем обновленный объект model
                });
            } else {
                setModelAdded(false); // Если модель уже добавлена, но landmarks отсутствуют, установим modelAdded в false
            }
        }

        canvasCtx.restore();
        // console.log("here");
        window.requestAnimationFrame(predictWebcam);
    };

    function enableWebcam() {
        // Start webcam and processing
        if (webcamRunning) return;
        const constraints = {
            video: {
                facingMode: 'environment' // Use back camera
            }
        };

        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setWebcamRunning(true);
            }
        }).catch((error) => {
            console.error("Error accessing webcam:", error);
        });
    };

    // Stop webcam and processing
    function disableWebcam() {
        if (videoRef.current) {
            const tracks = streamRef.current.getTracks();
            // console.log(tracks);
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setWebcamRunning(false);
        }
    };

    const handleCloseModal = () => {
        if(streamRef.current)
            disableWebcam();

        onClose();
    };

    useEffect(() => {
        if (webcamRunning) {
            predictWebcam();
            addModel();
        }
        return () => {
            setWebcamRunning(false);
        }
    }, [webcamRunning])

    useEffect(() => {
        if (!handLandmarker) {
            createHandLandmarker();
        }
        return () => {
            disableWebcam();
            if (handLandmarker) {
                handLandmarker.close();
            }
        }
    }, [])

    useEffect(() => {
        // const scene = new THREE.Scene();
        // const renderer = new THREE.WebGLRenderer({ alpha: true });
        // let camera = undefined;

        // if (canvasRef.current) {
        //     renderer.setSize(canvasRef.current.width, canvasRef.current.height);
        //     renderer.domElement.style.position = "absolute";
        //     renderer.domElement.style.top = "0";
        //     renderer.domElement.style.left = "0";
        //     renderer.physicallyCorrectLights = true;
        //     renderer.outputEncoding = THREE.sRGBEncoding;

        //     document.getElementById("overlay")?.appendChild(renderer.domElement);

        //     const ambientLight = new THREE.AmbientLight(0xFFFFFF);
        //     ambientLight.intensity = 2;
        //     scene.add(ambientLight);

        //     camera = new THREE.PerspectiveCamera(75, canvasRef.current.width / canvasRef.current.height, 0.1, 1000);
        //     camera.position.z = 5;

        //     const loader = new GLTFLoader();
        //     loader.load(
        //         'app/models/ring_black_and_red.glb',
        //         function(gltf) {
        //             const loadedModel = gltf.scene;
        //             loadedModel.scale.set(0.01, 0.01, 0.01);
        //             scene.add(loadedModel);
        //             setModel(loadedModel);
        //         },
        //         undefined,
        //         function(error) {
        //             console.error('An error happened', error);
        //         }
        //     );

        //     const animate = () => {
        //         requestAnimationFrame(animate);
        //         renderer.render(scene, camera);
        //     };
        //     animate();
        // }

        // return () => {
        //     if (renderer.domElement) {
        //         renderer.domElement.remove();
        //     }
        // };
    }, [canvasRef.current]);

    useEffect(() => {
        if (!modelAdded) {
            if (model) {
                model.scale.set(0, 0, 0);
                setModel(model);
            }
        }
    }, [modelAdded]);

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} size='full'>
            <ModalOverlay />
            <ModalContent w='100vh'>
                <ModalHeader>{ring.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Tabs variant='soft-rounded' colorScheme='purple'>
                        <TabList>
                            <Tab>Описание</Tab>
                            <Tab>Примерка</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <p>one!</p>
                            </TabPanel>
                            <TabPanel>
                                <Flex direction='column'>
                                    <Flex gap={2} direction='column'>
                                        {/* Video element for displaying webcam output */}
                                        <Flex direction='column' alignItems='center'>
                                            <video ref={videoRef} autoPlay muted style={{ width: '640px', height: '480px' }} />
                                            <canvas ref={canvasRef} style={{ position: 'absolute', left: '0px', top: '0px', zIndex: 99998 }}></canvas>
                                            <div ref={overlayRef} style={{ position: 'absolute', left: '0px', top: '0px', zIndex: 99999 }}></div>
                                        </Flex>
                                        <FormControl>
                                            <FormLabel>Настройки</FormLabel>
                                            <Stack>
                                                <Checkbox ref={landmarksCheckboxRef} isChecked={landmarksCheckbox} onChange={() => setLandmarksCheckbox(prev => !prev)}>Рисовать распознаваемые узлы</Checkbox>
                                                <Checkbox ref={connectorsCheckboxRef} isChecked={connectorsCheckbox} onChange={() => setConnectorsCheckbox(prev => !prev)}>Рисовать связи между узлами</Checkbox>
                                                <Checkbox ref={modelMovementCheckboxRef} isChecked={modelMovementCheckbox} onChange={() => setModelMovementCheckbox(prev => !prev)}>Заморозить движение кольца по Y координатам</Checkbox>
                                            </Stack>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Настройка размера кольца</FormLabel>
                                            <Slider aria-label='slider-ex-1' defaultValue={30} w='25%' ref={ringSizeSliderRef}>
                                                <SliderTrack>
                                                    <SliderFilledTrack />
                                                </SliderTrack>
                                                <SliderThumb bg='red' _active={{ 'bgColor': "yellow" }} />
                                            </Slider>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Изменить положение кольца по Y координатам</FormLabel>
                                            <Slider aria-label='slider-ex-1' defaultValue={30} w='25%'>
                                                <SliderTrack>
                                                    <SliderFilledTrack />
                                                </SliderTrack>
                                                <SliderThumb bg='red' _active={{ 'bgColor': "yellow" }} />
                                            </Slider>
                                        </FormControl>
                                        <Button onClick={enableWebcam}>Примерить</Button>
                                    </Flex>
                                    <Flex flexDirection='column' gap={2}>
                                        {/* Other components */}
                                    </Flex>
                                </Flex>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='red' mr={3} onClick={handleCloseModal}>
                        Закрыть
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ActionModal;
