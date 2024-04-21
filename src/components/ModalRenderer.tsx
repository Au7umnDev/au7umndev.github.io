import { Modal, Image, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, ModalFooter, Tab, TabList, TabPanel, TabPanels, Tabs, Flex, HStack, FormControl, FormHelperText, FormLabel, Input, Checkbox, Stack, Hide, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'

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
    const videoRef = useRef<HTMLVideoElement>(null); // Reference for accessing the video element

    function enableWebcam() {
        // Request access to the user's webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                // Access granted, attach the stream to the video element
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((error) => {
                // Handle errors, such as permission denied or unsupported browser
                console.error('Error accessing webcam:', error);
            });
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
                                        <video ref={videoRef} autoPlay muted style={{ width: '100%', height: 'auto' }} />
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