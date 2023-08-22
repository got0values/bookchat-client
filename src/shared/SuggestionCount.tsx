import { 
  Badge,
  Text,
  Box,
  Flex,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
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
      {suggestionCount > 0 ? (
        <Popover>
          <PopoverTrigger>
            <Badge
              as={Button}
              size="xs"
              minW="unset"
              height="unset"
              fontSize=".65rem"
              textTransform="none"
              p={.5}
              variant="solid"
              display="flex"
              alignItems="bottom"
              gap={1}
              aria-label="suggest books badge"
            >
              {suggestionCount > 0 && suggestionCount <= 9 ? (
                <Box as={GiChessPawn} size={9} mt={-.5}/>
              ) : (
                suggestionCount > 9 && suggestionCount <= 24 ? (
                  <FaChessKnight size={8}/>
                ) : (
                  suggestionCount > 24 && suggestionCount <= 49 ? (
                    <FaChessBishop size={8}/>
                  ) : (
                    suggestionCount > 49 && suggestionCount <= 99 ? (
                      <FaChessRook size={8}/>
                    ) : (
                      suggestionCount > 99 ? (
                        <GiChessQueen size={8}/>
                      ) : (
                        null
                      )
                    )
                  )
                )
              )}
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
        null
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