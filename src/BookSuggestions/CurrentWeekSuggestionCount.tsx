import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { 
  Progress,
  Flex,
  Text,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Image
} from "@chakra-ui/react";
import { ImInfo } from 'react-icons/im';
import kittyhose from '../assets/kittyhose2.png';
import bookfire5 from '../assets/bookfire5.svg';
import bookfire4 from '../assets/bookfire4.svg';
import bookfire3 from '../assets/bookfire3.svg';
import bookfire2 from '../assets/bookfire2.svg';
import bookfire1 from '../assets/bookfire1.svg';
import bookfire0 from '../assets/bookfire0.svg';

export default function CurrentWeekSuggestionCount() {
  const { user, getUser } = useAuth();
  const sCount = user?.Profile?._count?.BookSuggestion_BookSuggestion_suggestorToProfile;

  useEffect(()=>{
    getUser()
  },[])

  return (
    <Flex
      align="center"
      justify="center"
      w="100%"
      gap={2}
      wrap="nowrap"
      mt={2}
      mb={2}
      rounded="md"
      // bg="blue.50"
      // p={2}
      _dark={{
        bg: "blue.800"
      }}
    >
      <Text
        display="flex"
        justifyContent="space-between"
        align="center"
        gap={2}
        fontWeight="bold"
        w="auto"
        ms={1}
      >
        {(sCount / 5) * 100}%
      </Text>
      {sCount < 5 ? (
        <Image 
          src={kittyhose} 
          height="6rem" 
          mb={.5} 
          me={-5}
        />
      ):(
        <Text>
          You're awesome!
        </Text>
      )}
      <Progress 
        ms={-.5}
        height="14px"
        // rounded="sm"
        bg="gray.200"
        // maxW="200px"
        border="1px solid lightgrey"
        backgroundColor="white"
        borderRight="0"
        borderRadius="5px"
        colorScheme={sCount < 5 ? "teal" : "green"}
        flex="1 1 auto"
        hasStripe={sCount < 5 ? true : false}
        _dark={{
          bg: "gray.700"
        }}
        value={
          ((sCount > 0 ? sCount : .1) / 5) * 100
        } 
      />
      <Image 
        src=
        {
          sCount === 0 ? bookfire5 : (
            sCount === 1 ? bookfire4 : (
              sCount === 2 ? bookfire3 : (
                sCount === 3 ? bookfire2 : (
                  sCount === 4 ? bookfire1 : (
                    sCount === 5 ? bookfire0 : bookfire0
                  )
                )
              )
            )
          )
        } 
        height="6rem" 
        // mb={.5} 
        ms={-3}
      />
      <Popover isLazy>
        <PopoverTrigger>
          <Flex 
            align="center" 
            justify="center" 
            _hover={{
              cursor: "pointer"
            }}
            me={1}
          >
            <ImInfo size={20} />
          </Flex>
        </PopoverTrigger>
        <PopoverContent maxWidth="400px">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody 
            fontSize="sm"
            pe={10}
          >
            <Text fontWeight="bold">
              {sCount}/5 suggestions given today
            </Text>
            {/* <Text>
              Picture living in a world where reading options are influenced and limited by literary agents determining which authors get exposure based on mass appeal, online reviews and comments left by bots and internet trolls, and recommendations given by computers processing metadata through suspicious algorithms ignoring diversity and the complexity of readers' interests. They're all trying to manipulate us into reading what they want us to read. Help extinguish the fire and save our reading freedom by giving suggestions to fellow book lovers.
            </Text> */}
            <Text>Help extinguish the fire and save our reading freedom by giving suggestions to fellow book lovers.
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  )
}