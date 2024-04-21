import { Modal, Image, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, ModalFooter, Tab, TabList, TabPanel, TabPanels, Tabs, Flex, HStack, FormControl, FormHelperText, FormLabel, Input, Checkbox, Stack, Hide, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/holistic';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

function ActionModal({ modalType, isOpen, onClose, ring }: Props) {
    
    const demosSection = document.getElementById("demos");
    const ringSizeTextBox: any = document.getElementById("ringSizeTextBox");
    const toggleConnectorsCheckbox: any = document.getElementById("toggleConnectors");
    const toggleLandmarksCheckbox: any = document.getElementById("toggleLandmarks");
    const toggleModelMovementCheckbox: any = document.getElementById("toggleModelMovement");
    const ringSizeSlider: any = document.getElementById("ringSizeSlider");

    let currentSelectedRingInfo = undefined;
    let handLandmarker: HandLandmarker | undefined = undefined;
    let webcamRunning = false;
    let lastVideoTime = -1;
    let results: any = undefined; // Объявляем переменную results
    let modelAdded = false;
    let model = new THREE.Object3D();
    let position14: any = new Object;
    let position13: any = new Object;
    let positionRing: any = new Object;

    // console.log(currentSelectedRingInfo);

    // Before we can use HandLandmarker class we must wait for it to finish loading. Machine Learning models can be large and take a moment to get everything needed to run.
    const createHandLandmarker = async () => {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });
        demosSection?.classList.remove("invisible");
    };
    
    createHandLandmarker();

    // Continuously grab image from webcam stream and detect it.
    const video = document.getElementById("webcam") as HTMLVideoElement;
    const canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasCtx = canvasRef.current?.getContext("2d");

    const camera = new THREE.PerspectiveCamera(20, canvasElement.width / canvasElement.height, 0.1, 100);
    camera.position.z = 2;

    const videoRef = useRef<HTMLVideoElement>(null); // Reference for accessing the video element

    function enableWebcam() {
        if (webcamRunning) { 
            return;
        }
        // Start webcam and processing
        const constraints = {
                video: {
                    facingMode: 'environment' // Use back camera
                }
            };
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                video.srcObject = stream;
                video.addEventListener("loadeddata", predictWebcam);
                // document.getElementById("try_on").style.display = "block";
                webcamRunning = true;
            }).catch((error) => {
                console.error("Error accessing webcam:", error);
            });
    }

    function disableWebcam () {
        if (!webcamRunning) { 
            return;
        }
        // Stop webcam and processing
        const stream = video?.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop()); // Остановка всех треков видео
        video.srcObject = null;
        video.removeEventListener("loadeddata", predictWebcam);
        webcamRunning = false;
    }

    // Detect landmarks in webcam video
    async function predictWebcam() {
        // Проверяем, что handLandmarker создан
        if (!handLandmarker || !webcamRunning) {
            canvasCtx?.clearRect(0, 0, canvasElement.width, canvasElement.height);
            model.visible = false;
            console.log("HandLandmarker is not loaded or webcam is not running.");
            return;
        }

        canvasElement.style.width = video.videoWidth as unknown as string;
        canvasElement.style.height = video.videoHeight as unknown as string;
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;

        const currentTime = video.currentTime;
        if (currentTime !== lastVideoTime) {
            lastVideoTime = currentTime;
            results = handLandmarker.detectForVideo(video, performance.now());
            //console.log('results: ', results);  
        }

        canvasCtx?.save();
        canvasCtx?.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Отрисовываем лэндмарки, создаем модель, позиционируем ее относительно лэндмарки
        if (results && results.landmarks) {
            for (const landmarks of results.landmarks) {
                if (toggleConnectorsCheckbox.checked) {
                    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                        color: "#FFFFFF",
                        lineWidth: 5
                    });
                }
                if (toggleLandmarksCheckbox.checked) {
                    drawLandmarks(canvasCtx, landmarks, {
                        color: "#00BFFF",
                        lineWidth: 2
                    });
                }
            }
            if (!modelAdded && results.landmarks.length !== 0) {
                addModel();
                modelAdded = true;
            } else if (modelAdded && results.landmarks.length !== 0) {
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
                if (toggleModelMovementCheckbox.checked) positionRing.y = model.position.y;
                else positionRing.y = position14.y;
                positionRing.z = position14.z;
                ////

                let sliderValue = parseInt(ringSizeSlider.value) * 2 / 100;
                let newScale = results.landmarks[0][0].z * 70000 * sliderValue;
                //let newScale = results.landmarks[0][0].z * 50000;
                ringSizeTextBox.value = newScale;
                model.scale.set(newScale, newScale, newScale);

                model.position.copy(positionRing);
                model.visible = true; // Показываем модель

                // Вычисляем угол между горизонтальной прямой и прямой, образованной точками results.landmarks[0][13] и results.landmarks[0][14]
                let deltaY = position13.y - position14.y;
                let deltaX = position13.x - position14.x;
                let angle = Math.atan2(deltaY, deltaX);

                // Преобразуем радианы в градусы и вращаем модель по оси Z
                let degrees = angle * (180 / Math.PI);
                //console.log(degrees);
                model.rotation.z = degrees / 30;
            } else if (modelAdded && results.landmarks.length == 0) {
                model.visible = false; // Скрываем модель
            }
        }

        canvasCtx?.restore();

        // Call this function again to keep predicting when the browser is ready.
        if (webcamRunning) {
            window.requestAnimationFrame(predictWebcam);
        }
    }

    // Функция для добавления модели на сцену
    function addModel() {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(canvasElement.width, canvasElement.height);
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = "0";
        renderer.domElement.style.left = "0";
        // renderer.physicallyCorrectLights = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        document.getElementById("overlay")?.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF);
        ambientLight.intensity = 2;
        scene.add(ambientLight);

        const loader = new GLTFLoader();
        loader.load(
            'app/models/ring_black_and_red.glb',
            function(gltf) {
                model = gltf.scene;
                model.scale.set(0.01, 0.01, 0.01);
                scene.add(model);
            },
            undefined,
            function(error) {
                console.error('An error happened', error);
            }
        );

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    }

    useEffect(() => {
        // Cleanup function to stop the video stream when the component unmounts
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='full'>
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
                                        <video id="webcam" style={{position: 'relative'}} autoPlay playsInline></video>
                                        <canvas ref={canvasRef} className="output_canvas" id="output_canvas" style={{position: 'absolute', left: '0px', top: '0px'}}></canvas>
                                        <div id="overlay"></div>
                                        <FormControl>
                                            <FormLabel>Настройки</FormLabel>
                                            <Stack>
                                                <Checkbox>Рисовать распознаваемые узлы</Checkbox>
                                                <Checkbox>Рисовать связи между узлами</Checkbox>
                                                <Checkbox>Заморозить движение кольца по Y координатам</Checkbox>
                                            </Stack>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Настройка размера кольца</FormLabel>
                                            <Slider aria-label='slider-ex-1' defaultValue={30} w='25%'>
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
                    <Button colorScheme='red' mr={3} onClick={onClose}>
                        Закрыть
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default ActionModal