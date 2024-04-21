import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'
import RingCard from './RingCard'

const ringsRepository = [
    {
        name: 'ring_black_and_red 1',
        imageSrc: 'google.com',
        modelPath: 'app/models/ring_black_and_red.glb',
        description: 'asdasd'
    },
    {
        name: 'asdasd 2',
        imageSrc: 'google.com',
        modelPath: '',
        description: 'asdasd'
    },
    {
        name: 'asdasd 3',
        imageSrc: 'google.com',
        modelPath: '',
        description: 'asdasd'
    },
]

function RingsGrid() {
    return (
        <Grid templateColumns='repeat(4, 1fr)' gap={6}>
            {ringsRepository.map(item => <GridItem><RingCard ring={item} /></GridItem>)}
        </Grid>
    )
}

export default RingsGrid