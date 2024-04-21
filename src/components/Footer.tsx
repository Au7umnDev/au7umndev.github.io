import React from 'react'
import { Flex, Text } from '@chakra-ui/react';

function Footer() {
    return (
        <Flex direction='column' alignItems='center' m={2}>
            <Text color='gray.400' textAlign='center'>© Косилов Глеб Игоревич, студент группы ИДМ-22-04</Text>
            <Text color='gray.400' textAlign='center'>Работа сделана в рамках выполнения выпускной квалификационной работы по теме «Исследование иммерсивных технологий и применение технологии дополненной реальности при цифровой трансформации предприятия» на присвоение квалификации «магистр» по направлению 09.04.01 «Информатика и вычислительная техника»</Text>
        </Flex>
    )
}

export default Footer