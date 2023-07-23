import { 
  Badge,
  Text,
  Box,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverContent,
  PopoverFooter,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import { GiChessPawn, GiChessQueen } from "react-icons/gi";
import { FaChessKnight, FaChessBishop, FaChessRook } from "react-icons/fa"

const SuggestionColorLegend = () => {
  return (
    <Box>
      <Flex align="center" gap={1}>
        <Box
          backgroundColor="#718096"
          height="15"
          width="15px"
        >
        </Box>
        <Text>
          1 to 9
        </Text>
      </Flex>
      <Flex align="center" gap={1}>
        <Box
          backgroundColor="purple"
          height="15"
          width="15px"
        >
        </Box>
        <Text>
          10 to 24
        </Text>
      </Flex>
      <Flex align="center" gap={1}>
        <Box
          backgroundColor="blue"
          height="15"
          width="15px"
        >
        </Box>
        <Text>
          24 to 49
        </Text>
      </Flex>
      <Flex align="center" gap={1}>
        <Box
          backgroundColor="orange"
          height="15"
          width="15px"
        >
        </Box>
        <Text>
          49 to 99
        </Text>
      </Flex>
      <Flex align="center" gap={1}>
        <Box
          backgroundColor="yellow"
          height="15"
          width="15px"
        >
        </Box>
        <Text>
          99+
        </Text>
      </Flex>
    </Box>
  )
}

export function SuggestionCountBadge({suggestionCount}: {suggestionCount: number}) {
  return (
    <>
      {suggestionCount > 0 && suggestionCount <= 9 ? (
        <Popover>
          <PopoverTrigger>
          <Badge
            fontSize=".65rem"
            textTransform="none"
            py={.5}
            variant="solid"
            display="flex"
            alignItems="bottom"
            gap={1}
          >
            <Box as={GiChessPawn} size={15} mt={-.5}/>
          </Badge>
          </PopoverTrigger>
          <PopoverContent maxW="260px" fontSize="sm">
            <PopoverArrow/>
            <PopoverCloseButton/>
            {/* <PopoverHeader
              fontWeight="bold"
            >
              Novice Reader's Advisor
            </PopoverHeader> */}
            <PopoverBody>
              <Text as="span" fontStyle="italic" >{suggestionCount}</Text> suggestion{suggestionCount > 1 ? "s" : null} given to other users
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        suggestionCount > 9 && suggestionCount <= 24 ? (
          <Popover>
            <PopoverTrigger>
            <Badge
              fontSize=".65rem"
              textTransform="none"
              py={.5}
              variant="solid"
              colorScheme="purple"
              display="flex"
              alignItems="top"
              gap={1}
            >
              <FaChessKnight size={13}/>
            </Badge>
            </PopoverTrigger>
            <PopoverContent maxW="260px" fontSize="sm">
              <PopoverArrow/>
              <PopoverCloseButton/>
              {/* <PopoverHeader
                fontWeight="bold"
              >
                Intermediate Reader's Advisor
              </PopoverHeader> */}
              <PopoverBody>
                <Text as="span" fontStyle="italic" >{suggestionCount}</Text> suggestions given to other users
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          suggestionCount > 24 && suggestionCount <= 49 ? (
            <Popover>
              <PopoverTrigger>
              <Badge
                fontSize=".65rem"
                textTransform="none"
                py={.5}
                variant="solid"
                colorScheme="blue"
                display="flex"
                alignItems="top"
                gap={1}
              >
                <FaChessBishop size={13}/>
              </Badge>
              </PopoverTrigger>
              <PopoverContent maxW="260px" fontSize="sm">
                <PopoverArrow/>
                <PopoverCloseButton/>
                {/* <PopoverHeader
                  fontWeight="bold"
                >
                  Proficient Reader's Advisor
                </PopoverHeader> */}
                <PopoverBody>
                  <Text as="span" fontStyle="italic" >{suggestionCount}</Text> suggestions given to other users
                </PopoverBody>
              </PopoverContent>
            </Popover>
          ) : (
            suggestionCount > 49 && suggestionCount <= 99 ? (
              <Popover>
                <PopoverTrigger>
                <Badge
                  fontSize=".65rem"
                  textTransform="none"
                  py={.5}
                  variant="solid"
                  colorScheme="orange"
                  display="flex"
                  alignItems="top"
                  gap={1}
                >
                  <FaChessRook size={13}/>
                </Badge>
                </PopoverTrigger>
                <PopoverContent maxW="260px" fontSize="sm">
                  <PopoverArrow/>
                  <PopoverCloseButton/>
                  {/* <PopoverHeader
                    fontWeight="bold"
                  >
                    Master Reader's Advisor
                  </PopoverHeader> */}
                  <PopoverBody>
                    <Text as="span" fontStyle="italic" >{suggestionCount}</Text> suggestions given to other users
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            ) : ( 
              suggestionCount > 99 ? (
                <Popover>
                  <PopoverTrigger>
                  <Badge
                    fontSize=".65rem"
                    textTransform="none"
                    py={.5}
                    variant="solid"
                    colorScheme="yellow"
                    display="flex"
                    alignItems="top"
                    gap={1}
                  >
                    <GiChessQueen size={13}/>
                  </Badge>
                  </PopoverTrigger>
                  <PopoverContent maxW="260px" fontSize="sm">
                    <PopoverArrow/>
                    <PopoverCloseButton/>
                    {/* <PopoverHeader
                      fontWeight="bold"
                    >
                      Supreme Master Reader's Advisor
                    </PopoverHeader> */}
                    <PopoverBody>
                      <Text as="span" fontStyle="italic" >{suggestionCount}</Text> suggestions given to other users
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              ) : ( 
                null
              )
            )
          )
        )
      )}
    </>
  )
}

export function SuggestionCountText({suggestionCount}: {suggestionCount: number}) {
  return (
    <>
      {suggestionCount > 0 && suggestionCount <= 9 ? (
        <Text
          fontSize=".65rem"
        >
          {suggestionCount} suggestions given to others
        </Text>
      ) : (
        suggestionCount > 9 && suggestionCount <= 24 ? (
          <Text
            fontSize=".65rem"
          >
            {suggestionCount} suggestions given to others
          </Text>
        ) : (
          suggestionCount > 24 && suggestionCount <= 49 ? (
            <Text
              fontSize=".65rem"
            >
              {suggestionCount} suggestions given to others
            </Text>
          ) : (
            suggestionCount > 49 && suggestionCount <= 99 ? (
              <Text
                fontSize=".65rem"
              >
                {suggestionCount} suggestions given to others
              </Text>
            ) : ( 
              suggestionCount > 99 ? (
                <Text
                  fontSize=".65rem"
                >
                  {suggestionCount} suggestions given to others
                </Text>
              ) : ( 
                <Text
                  fontSize=".65rem"
                >
                  {suggestionCount} suggestions given to others
                </Text>
              )
            )
          )
        )
      )}
    </>
  )
}