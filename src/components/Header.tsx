import { Flex, Heading } from '@chakra-ui/react';

function Header() {
  return (
    <Flex flexDirection="column" alignItems="center" bg="gray.600" boxShadow="md" w="100%" p={4} mb={10}>
      <Heading size="md" color="white">
        Примерка колец с применением дополненной реальности v7
      </Heading>
    </Flex>
  );
}

export default Header;
