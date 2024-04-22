import { Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Divider, Heading, Image, Stack, Text, useDisclosure } from '@chakra-ui/react'
import React, { useState } from 'react'
import ModalRenderer from './ModalRenderer'


type Ring = {
    name: string,
    imageSrc: string,
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
            <Card>
                <CardBody>
                    <Image
                        src='https://www.dummyimage.co.uk/256x256/cbcbcb/959595/Dummy%20Image/40'
                        alt='Green double couch with wooden legs'
                        borderRadius='lg'
                    />
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