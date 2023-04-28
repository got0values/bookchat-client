import React from "react";
import { 
  Text,
  Box,
  Flex,
  Image,
  Stack,
  Heading,
  Link,
  useColorModeValue
} from "@chakra-ui/react";
import logo from './assets/community-book-club-logo3.png';
import logoWhite from './assets/community-book-club-logo3-white.png';

const Terms = () => {

  return (
    <Flex
      justify={'center'}
      p={5}
    >
      <Stack>
        <Link
          href="/register"
          display="flex"
          justifyContent="center"
          mb={2}
        >
          <Image 
            src={useColorModeValue(logo,logoWhite)} 
            maxH="75px"
          />
        </Link>
        <Stack 
          spacing={3} 
          maxW={'2xl'}
          p={4}
          backgroundColor="white"
          boxShadow="base"
          rounded="sm"
          _dark={{
            backgroundColor: "white"
          }}
        >
          <Heading as="h1" size="lg" textAlign="center">
            Terms and Conditions
          </Heading>
          <Heading as="h2" size="md">
            1. Terms of use
          </Heading>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non risus pharetra, consequat diam vel, tristique dui. Nulla gravida varius leo eget porttitor. Suspendisse hendrerit, augue in mollis congue, est magna accumsan nunc, ac lacinia dui risus vel risus. Curabitur sit amet dapibus lacus, id bibendum odio. Fusce at vestibulum erat, sed consequat erat. Vestibulum a accumsan leo. Maecenas non tellus nulla. Pellentesque tincidunt libero libero, ac condimentum libero pretium eu.
          </Text>
          <Text>
            Mauris sollicitudin bibendum sem. Integer vitae ligula condimentum, efficitur ipsum et, imperdiet est. Maecenas luctus tempor turpis, sit amet rhoncus felis finibus semper. Cras purus metus, tincidunt ac dolor ac, ultrices accumsan felis. Integer tristique tortor eget massa interdum faucibus. Aenean non sodales magna. Mauris tristique magna ac enim ornare viverra. Suspendisse elit sem, dignissim sit amet est id, pharetra semper nisl. Nunc interdum dolor a purus sagittis efficitur. Integer molestie mi mi, cursus tristique tortor molestie id. Aliquam blandit libero risus, nec congue ex auctor eget. Cras tincidunt vel lacus at porta. Vestibulum cursus nulla quis urna pulvinar, at auctor ligula vehicula. Curabitur mattis congue volutpat.
          </Text>
          <Text>
            Curabitur faucibus eros tempus est elementum, at faucibus lacus mattis. Fusce at lectus venenatis, vestibulum libero et, iaculis mauris. Praesent nunc urna, volutpat nec ultrices et, tristique vitae velit. Nam aliquet condimentum porttitor. Cras tincidunt fermentum ultrices. Curabitur aliquet, felis dignissim tempor imperdiet, nisi eros sagittis urna, et pretium tellus sem eu quam. Suspendisse pretium diam ac sem accumsan sagittis vitae et tellus. Suspendisse vehicula nisi et metus tincidunt finibus. Duis gravida, orci cursus consequat mollis, eros velit faucibus justo, vel facilisis tellus metus non ligula. Phasellus sed diam sed orci venenatis lacinia. Morbi eget mi a mi sollicitudin tincidunt ac in elit. In ac ante sed est ullamcorper egestas. Aenean blandit ex vitae luctus fermentum. Nulla pretium, sapien vitae semper pellentesque, orci mauris viverra libero, ac rhoncus nisi massa eu sapien. Pellentesque eu erat purus. Suspendisse tincidunt, urna sit amet mollis vulputate, libero augue elementum erat, eget placerat lectus libero quis tortor.
          </Text>
          <Text>
            Maecenas elementum libero at urna fringilla, eget dignissim mauris luctus. Nullam et placerat velit. Duis sollicitudin ultricies leo, at finibus mi sagittis eget. Maecenas quis suscipit elit. Mauris ut mi vel leo sodales volutpat non nec ligula. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc fermentum odio eu mi egestas bibendum. In mattis tincidunt urna, scelerisque pharetra ligula rutrum gravida. Fusce ullamcorper libero eu fermentum consequat. Praesent faucibus condimentum nisi, nec tincidunt odio hendrerit eu. Interdum et malesuada fames ac ante ipsum primis in faucibus.
          </Text>
          <Text>
            Suspendisse posuere ipsum sit amet mi pulvinar, et blandit enim aliquet. Proin porttitor molestie eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Fusce a quam tortor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis vulputate bibendum placerat. Curabitur ipsum mi, congue sit amet luctus sed, consequat ac dolor.
          </Text>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default Terms;
