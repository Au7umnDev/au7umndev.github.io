/* eslint-disable */

import { Button, Card, CardBody, CardFooter, Divider, Heading, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { Carousel } from 'react-responsive-carousel';
import React, { useState } from 'react'
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ModalRenderer from './ModalRenderer'


type Ring = {
    name: string,
    imageSrc: string[],
    modelPath: string,
    description: string
}

type Props = {
    ring: Ring
}

function RingCard({ ring }: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalType, setModalType] = useState("");
    const openModal = () => {
        setModalType('')
        onOpen()
      }
    return (
        <>
            <Card ml="20px" mr="20px" mt="20px" mb="20px">
                <CardBody>
                    <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows swipeable emulateTouch>
                        {ring.imageSrc.map((src, index) => (
                            <div key={index}>
                                <img src={src} alt={`Image ${index + 1}`} style={{ width: 'auto', height: 'auto', borderRadius: 'lg' }} />
                                 {ring.modelPath != '' && (
                                 <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(128,0,128,0.8)', color: '#fff', padding: '5px', borderRadius: '5px', fontSize: '14px' }}>&nbsp;Примерка&nbsp;</div>
                                 )}
                            </div>
                        ))}
                    </Carousel>
                    <Stack mt='6' spacing='3'>
                        <Heading size='md'>{ring.name}</Heading>
                        <Text>
                            {ring.description}
                        </Text>
                    </Stack>
                </CardBody>
                <Divider />
                <CardFooter display='flex' justifyContent='center'>
                    <Button width='100%' onClick={openModal}>Подробнее</Button>
                </CardFooter>
            </Card>
            {isOpen && <ModalRenderer modalType={'test'} isOpen={isOpen} onClose={onClose} ring={ring} />}
        </>
    )
}

export default RingCard