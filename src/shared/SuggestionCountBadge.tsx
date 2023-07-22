import { 
  Badge,
  Text,
  Box
} from "@chakra-ui/react";
import { GiChessPawn, GiChessQueen } from "react-icons/gi";
import { FaChessKnight, FaChessBishop, FaChessRook } from "react-icons/fa"

export default function SuggestionCountBadge({suggestionCount}: {suggestionCount: number}) {
  return (
    <>
      {suggestionCount > 0 && suggestionCount <= 9 ? (
        <Badge
          fontSize=".65rem"
          textTransform="none"
          pt={.5}
          variant="solid"
          display="flex"
          alignItems="bottom"
          gap={1}
        >
          <Box as={GiChessPawn} size={15} mt={-.5}/> Level 1 Advisor
        </Badge>
      ) : (
        suggestionCount > 9 && suggestionCount <= 24 ? (
          <Badge
            fontSize=".65rem"
            textTransform="none"
            pt={.5}
            variant="solid"
            colorScheme="green"
            display="flex"
            alignItems="top"
            gap={1}
          >
            <FaChessKnight size={13}/> Level 2 Advisor
          </Badge>
        ) : (
          suggestionCount > 24 && suggestionCount <= 49 ? (
            <Badge
              fontSize=".65rem"
              textTransform="none"
              pt={.5}
              variant="solid"
              colorScheme="blue"
              display="flex"
              alignItems="top"
              gap={1}
            >
              <FaChessBishop size={13}/> Level 3 Advisor
            </Badge>
          ) : (
            suggestionCount > 49 && suggestionCount <= 99 ? (
              <Badge
                fontSize=".65rem"
                textTransform="none"
                pt={.5}
                variant="solid"
                colorScheme="orange"
                display="flex"
                alignItems="top"
                gap={1}
              >
                <FaChessRook size={13}/> Level 4 Advisor
              </Badge>
            ) : ( 
              suggestionCount > 99 ? (
                <Badge
                  fontSize=".65rem"
                  textTransform="none"
                  pt={.5}
                  variant="solid"
                  colorScheme="yellow"
                  display="flex"
                  alignItems="top"
                  gap={1}
                >
                  <GiChessQueen size={13}/> Top Advisor
                </Badge>
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