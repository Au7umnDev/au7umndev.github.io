import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'
import RingCard from './RingCard'

const ringsRepository = [
    {
        name: 'ring_black_and_red 1',
        imageSrc: 'google.com',
        modelPath: 'src/models/ring_black_and_red.glb',
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