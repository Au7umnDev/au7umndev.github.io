import { Box, Heading, Text } from '@chakra-ui/react'
import React from 'react'

function Header() {
  return (
    <Box display="flex" alignItems="center" bg="gray.600" w="100vw" maxW='100vw' p={0} m={0} h="5vh" mb={10}>
        <Heading size="md" pl={5} color="white">Примерка колец с использованием технологии дополненной реальности</Heading>
    </Box>
  )
}

export default Header