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
} from "@chakra-ui/react";
import { ImInfo } from 'react-icons/im';

export default function CurrentWeekSuggestionCount() {
  const { user, getUser } = useAuth();

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
      mb={5}
      rounded="md"
      bg="blue.50"
      p={2}
      _dark={{
        bg: "blue.800"
      }}
    >
      <Progress 
        height="27px"
        rounded="sm"
        bg="gray.200"
        // maxW="200px"
        colorScheme="teal"
        flex="1 1 auto"
        hasStripe 
        _dark={{
          bg: "gray.700"
        }}
        value={
          ((user?.Profile?._count?.BookSuggestion_BookSuggestion_suggestorToProfile > 0 ? user?.Profile?._count?.BookSuggestion_BookSuggestion_suggestorToProfile : .03) / 5) * 100
        } 
      />
      <Text
        display="flex"
        justifyContent="space-between"
        align="center"
        gap={2}
        fontWeight="bold"
        w="auto"
      >
        {(user?.Profile?._count?.BookSuggestion_BookSuggestion_suggestorToProfile / 5) * 100}%
      </Text>
      <Popover isLazy>
        <PopoverTrigger>
          <Flex 
            align="center" 
            justify="center" 
            _hover={{
              cursor: "pointer"
            }}
          >
            <ImInfo size={17} color="gray" />
          </Flex>
        </PopoverTrigger>
        <PopoverContent width="auto">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody 
            fontSize="sm"
            pe={10}
          >
            {user?.Profile?._count?.BookSuggestion_BookSuggestion_suggestorToProfile}/5 suggestions given today
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  )
}