import { Box, Container, keyframes } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const animationKeyframes = keyframes`
  0% { transform: scale(2); opacity: 0;}
  50% { transform: scale(1.25); opacity: .5;}
  100% { transform: scale(1); opacity: 1;}
`;

const animation = `${animationKeyframes} 1s ease-in 1`;

export const CheckedAnimation = () => {

  return (
    <Container 
      h="75vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
    >
      <Box
        position="relative"
        width="225px"
        height="225px"
        border="1px solid teal"
        // borderRadius="50%"
      >
        <Box
          as={motion.div}
          width="100%"
          height="100%"
          animation={animation}
        >
          <Box
            backgroundColor="teal"
            position="absolute"
            width="60px"
            height="200px"
            left="110px"
            top="19px"
            transform="rotate(45deg)"
          />
          <Box
            backgroundColor="teal"
            position="absolute"
            width="60px"
            height="130px"
            left="24px"
            top="90px"
            transform="rotate(-45deg)"
          />
        </Box>
      </Box>
    </Container>
  )
}