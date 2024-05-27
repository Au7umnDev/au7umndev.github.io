import { Text, Modal, Image, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, ModalFooter, Tab, TabList, TabPanel, TabPanels, Tabs, Flex, FormControl, FormLabel, Checkbox, Stack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three';
import { Carousel } from 'react-responsive-carousel';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/holistic';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ringModelAtom } from '../atomStorage';
import { useAtom } from 'jotai';

type Ring = {
    name: string,
    imageSrc: string[],
    modelPath: string,
    description: string,
    totalDescription: string,
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
    const cameraRef = useRef<any>(null);
    const ringPosRef = useRef<any>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [connectorsCheckbox, setConnectorsCheckbox] = useState<boolean>(false);
    const [landmarksCheckbox, setLandmarksCheckbox] = useState<boolean>(false);
    const connectorsCheckboxRef = useRef<HTMLInputElement>(null);
    const landmarksCheckboxRef = useRef<HTMLInputElement>(null);

    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
    const [modelAdded, setModelAdded] = useState<boolean>(false);
    const [model, setModel] = useAtom(ringModelAtom);
    const [showInstruction, setShowInstruction] = useState(true);
    const [showImage, setShowImage] = useState(true);

    const createHandLandmarker = async () => {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
        const newHandLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: './ar_ring_try-on/src/models/hand_landmarker.task',
                // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
        });
        setHandLandmarker(newHandLandmarker);
    };

    const addModel = () => {
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        const camera = new THREE.PerspectiveCamera(20, 640 / 480, 0.1, 1000); // Инициализация объекта camera
        camera.position.z = 3;
        cameraRef.current = camera;

        // canvasRef.current!.width / canvasRef.current!.height
        
        renderer.setSize(640, 480);
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = `${videoRef.current?.offsetTop}px`;
        renderer.domElement.style.left = `${videoRef.current?.offsetLeft}px`;
        renderer.domElement.width = 640;
        renderer.domElement.height = 480;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

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

        // video.width = videoRef.current?.videoWidth || 0;
        // video.height = videoRef.current?.videoHeight || 0;

        // console.log('video width: ' + videoRef.current?.offsetWidth + '. Real video width: ' + videoRef.current?.videoWidth);
        // console.log('video height: ' + videoRef.current?.offsetHeight + '. Real video height: ' + videoRef.current?.videoHeight);

        // videoRef.current.style.width = videoRef.current?.videoWidth + 'px';
        // videoRef.current.style.height = videoRef.current?.videoHeight + 'px';

        canvasElement.width = videoRef.current?.offsetWidth || 0;
        canvasElement.height = videoRef.current?.offsetHeight || 0;
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
                //// Для фаланги после костяшки
                position14.x = (results.landmarks[0][14].x) * 2 - 1; // Преобразование x в диапазон [-1, 1]
                position14.y = (1 - results.landmarks[0][14].y) * 2 - 1; // Преобразование y в диапазон [-1, 1]
                position14.z = -1; // Без Z позиция не копируется
                //// Для костяшки
                position13.x = (results.landmarks[0][13].x) * 2 - 1; // Преобразование x в диапазон [-1, 1]
                position13.y = (1 - results.landmarks[0][13].y) * 2 - 1; // Преобразование y в диапазон [-1, 1]
                //// Для кольца
                positionRing.x = (position14.x + position13.x) / 2;
                positionRing.y = (position14.y + position13.y) / 2;
                positionRing.z = position14.z;
                ////

                // console.log(position14.y, position13.y);

                ringPosRef.current = positionRing;
                // console.log(ringPosRef.current.z)
                // console.log(ringPosRef.current.x, ringPosRef.current.y, ringPosRef.current.z);
                cameraRef.current.position.x = positionRing.x * 0.08;
                cameraRef.current.position.y = positionRing.y * 0.3;
                // console.log(cameraRef.current.position.x, cameraRef.current.position.y);

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
                    updatedModel.position.set(ringPosRef.current.x, ringPosRef.current.y, ringPosRef.current.z);
                    updatedModel.scale.set(newScale, newScale, newScale); // Устанавливаем новые координаты позиции
                    updatedModel.rotation.z = (degrees * Math.PI / 180) + 80; // Устанавливаем новые координаты позиции. Пока сам понятия не имею почему именно + 80, но пусть будет
                    return updatedModel; // Возвращаем обновленный объект model
                });
            } else {
                setModelAdded(false); // Если модель уже добавлена, но landmarks отсутствуют, установим modelAdded в false
            }
        }

        canvasCtx.restore();
        window.requestAnimationFrame(predictWebcam);
    };

    function enableWebcam() {
        // Start webcam and processing
        if (webcamRunning) return;

        setShowInstruction(false);
        setShowImage(false);

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
            tracks.forEach((track: { stop: () => any; }) => track.stop());
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
                            {ring.modelPath != '' && (
                            <Tab>Примерка</Tab>
                            )}
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows swipeable emulateTouch>
                                    {ring.imageSrc.map((src, index) => (
                                        <div key={index}>
                                            <img src={src} alt={`Image ${index + 1}`} style={{ width: 'auto', height: 'auto', borderRadius: 'lg' }} />
                                        </div>
                                    ))}
                                </Carousel>
                                {ring.modelPath != '' && (
                                <Flex justify='center' align='center' p={4} bg='purple.100' color='purple.800' borderRadius='md' fontWeight='bold' mt={4}>
                                Это кольцо можно примерить с помощью дополненной реальности! Перейдите во вкладку "Примерка".
                                </Flex>
                                )}
                                <Text mt="10px" fontSize="lg" textAlign="justify" fontStyle="italic" color="gray.900">
                                    {ring.totalDescription}
                                </Text>
                            </TabPanel>
                            <TabPanel>
                                <Flex direction='column'>
                                    <Flex gap={2} direction='column'>
                                        <Flex direction='column' alignItems='center'>
                                            {showImage && (
                                            <Image src={'/src/img/no_camera.jpg'} alt="Waiting for camera..." style={{ position: 'absolute', width: '640px', height: '480px', zIndex: 99995 }}/>
                                            )}
                                            <video ref={videoRef} autoPlay muted style={{ pointerEvents: 'none', width: '640px', height: '480px' }} />
                                            <canvas ref={canvasRef} style={{ pointerEvents: 'none', position: 'absolute', left: '0px', top: '0px', zIndex: 99998 }}></canvas>
                                            <div ref={overlayRef} style={{ pointerEvents: 'none', position: 'absolute', left: '0px', top: '0px', zIndex: 99999 }}></div>
                                        </Flex>
                                        <FormControl>
                                            <FormLabel>Настройки</FormLabel>
                                            <Stack>
                                                <Checkbox ref={landmarksCheckboxRef} isChecked={landmarksCheckbox} onChange={() => setLandmarksCheckbox(prev => !prev)}>Рисовать распознаваемые узлы</Checkbox>
                                                <Checkbox ref={connectorsCheckboxRef} isChecked={connectorsCheckbox} onChange={() => setConnectorsCheckbox(prev => !prev)}>Рисовать связи между узлами</Checkbox>
                                                {/* <Checkbox ref={modelMovementCheckboxRef} isChecked={modelMovementCheckbox} onChange={() => setModelMovementCheckbox(prev => !prev)}>Заморозить движение кольца по Y координатам</Checkbox> */}
                                            </Stack>
                                        </FormControl>
                                        <Button onClick={enableWebcam}>Примерить</Button>
                                        { showInstruction && (
                                        <Flex justify='center' align='center' p={4} bg='purple.100' color='purple.800' borderRadius='md' fontWeight='bold' mt={4}>
                                        Чтобы начать примерку кольца на палец с применением вашей камеры, нажмите на кнопку "Примерить".
                                        </Flex>
                                        )}
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
