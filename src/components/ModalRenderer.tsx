import { Modal, Image, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, ModalFooter, Tab, TabList, TabPanel, TabPanels, Tabs, Flex, HStack, FormControl, FormHelperText, FormLabel, Input, Checkbox, Stack, Hide, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
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

function ActionModal({ isOpen, onClose, ring }: Props) {
    const demosSectionRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ringSizeTextBoxRef = useRef<HTMLInputElement>(null);
    const toggleConnectorsCheckboxRef = useRef<HTMLInputElement>(null);
    const toggleLandmarksCheckboxRef = useRef<HTMLInputElement>(null);
    const toggleModelMovementCheckboxRef = useRef<HTMLInputElement>(null);
    const ringSizeSliderRef = useRef<HTMLInputElement>(null);

    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
    const [results, setResults] = useState<any>(null);
    const [modelAdded, setModelAdded] = useState<boolean>(false);
    const [model, setModel] = useState<THREE.Object3D>(new THREE.Object3D());
    const [position14, setPosition14] = useState<any>({});
    const [position13, setPosition13] = useState<any>({});
    const [positionRing, setPositionRing] = useState<any>({});

    function enableWebcam() {
        // Your logic for enabling webcam
    };

    function disableWebcam() {
        // Your logic for disabling webcam
    };

    useEffect(() => {
        const createHandLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2
            });
            setHandLandmarker(handLandmarker);
            if (demosSectionRef.current) {
                demosSectionRef.current.classList.remove("invisible");
            }
        };
        createHandLandmarker();

        return () => {
            if (handLandmarker) {
                handLandmarker.close();
            }
        };
    }, []);

    useEffect(() => {
        if (webcamRunning) {
            enableWebcam();
        } else {
            disableWebcam();
        }

        return () => {
            disableWebcam();
        };
    }, [webcamRunning]);

    useEffect(() => {
        if (!canvasRef.current || !canvasRef.current.getContext || !toggleConnectorsCheckboxRef.current || !toggleLandmarksCheckboxRef.current || !toggleModelMovementCheckboxRef.current || !ringSizeSliderRef.current) {
            return;
        }

        const predictWebcam = async () => {
            const video = document.getElementById("webcam") as HTMLVideoElement;
            const canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
            const canvasCtx = canvasElement.getContext("2d");

            if (!canvasCtx) {
                return;
            }

            if (!handLandmarker || !webcamRunning) {
                canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                setModelAdded(false);
                console.log("HandLandmarker is not loaded or webcam is not running.");
                return;
            }

            canvasElement.style.width = video.videoWidth + 'px';
            canvasElement.style.height = video.videoHeight + 'px';
            canvasElement.width = video.videoWidth;
            canvasElement.height = video.videoHeight;

            const currentTime = video.currentTime;
            if (currentTime !== video.currentTime) {
                setResults(handLandmarker.detectForVideo(video, performance.now()));
            }

            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            if (results && results.landmarks) {
                for (const landmarks of results.landmarks) {
                    if (toggleConnectorsCheckboxRef.current?.checked) {
                        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                            color: "#FFFFFF",
                            lineWidth: 5
                        });
                    }
                    if (toggleLandmarksCheckboxRef.current?.checked) {
                        drawLandmarks(canvasCtx, landmarks, {
                            color: "#00BFFF",
                            lineWidth: 2
                        });
                    }
                }
                if (!modelAdded && results.landmarks.length !== 0) {
                    addModel();
                    setModelAdded(true);
                } else if (modelAdded && results.landmarks.length !== 0) {
                    // Your logic for updating model position, rotation, etc.
                } else if (modelAdded && results.landmarks.length === 0) {
                    setModelAdded(false);
                }
            }

            canvasCtx.restore();

            if (webcamRunning) {
                window.requestAnimationFrame(predictWebcam);
            }
        };

        predictWebcam();

        return () => {
            // Cleanup logic
        };

        function addModel() {
            // Your logic for adding 3D model
        };
    }, [results, webcamRunning, modelAdded]);

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
                                            <Checkbox ref={toggleLandmarksCheckboxRef}>Рисовать распознаваемые узлы</Checkbox>
                                            <Checkbox ref={toggleConnectorsCheckboxRef}>Рисовать связи между узлами</Checkbox>
                                            <Checkbox ref={toggleModelMovementCheckboxRef}>Заморозить движение кольца по Y координатам</Checkbox>
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
                <Button colorScheme='red' mr={3} onClick={onClose}>
                    Закрыть
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    );
}

export default ActionModal;
