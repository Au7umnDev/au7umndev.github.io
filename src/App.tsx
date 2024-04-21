import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Flex, Spacer } from '@chakra-ui/react'
import Footer from './components/Footer'
import RingsGrid from './components/RingsGrid'
import Header from './components/Header'

function App() {

  return (
    <Flex w='100vw' h='100%' p={0} m={0} bgColor='gray.100' direction='column' alignItems='center'>
      <Header />
      <RingsGrid />
      <Spacer />
      <Footer />
    </Flex>
  )
}

export default App
