import { 
  Box,
  Flex,
  Text,
  Heading,
  Stack
} from "@chakra-ui/react";
import { BsFillChatFill, BsPostcardHeartFill } from 'react-icons/bs';
import { AiFillHome } from 'react-icons/ai';
import { FaBookReader } from 'react-icons/fa';
import { ImBooks, ImStatsDots } from 'react-icons/im';

export default function Documentation() {

  return (
    <Box className="main-content-smaller" p={2} pb={20}>
      <Stack>
        <Heading as="h1" size="lg" textAlign="center">Documentation</Heading>
        <Text>
          Book Chat Noir is for readers who are looking for something other than centralized book reviews and AI-driven book recommendations. To get the most out of Book Chat Noir, we suggest that you find users to follow or invite friends to join.
        </Text>
        <Flex align="center" gap={2}>
          <Box minW="120px">
            <AiFillHome size={25}/>  <b>HOME</b>
          </Box>
          <Box>
            <Text>
              Share what you're currently reading and view a feed of what other's are reading. Click on a book title to view its description. Add to your TBR list if you think it's worthy. This is also a good place to find users to follow.
            </Text>
          </Box>
        </Flex>
        <Flex align="center" gap={2}>
          <Box minW="120px">
            <ImBooks size={25}/> <b>BOOKSHELF</b>
          </Box>
          <Box>
            <Text>
              Add books you've read to track your reading history. Add personal notes to a book for things you'd like to remember. Create and apply tags so you can categorize however you'd like. Review your books and toggle "Request Suggestions" on to make your bookshelf public and to allow others to send you suggestions.
            </Text>
            <Text>
              TBR is where you'll find a list of books you've added to your TBR list.
            </Text>
          </Box>
        </Flex>
        <Flex align="center" gap={2}>
          <Box minW="120px">
            <BsPostcardHeartFill size={25}/> <b>SUGGESTIONS</b>
          </Box>
          <Box>
            <Text>
              Browse bookshelves of other users to find TBR ideas from similar readers. If you think a bookshelf owner would like a certain book that isn't on their bookshelf, send them a friendly suggestion.
            </Text>
            <Text>
              "Ratings" is where you'll find ratings for books you've suggested to other users.
            </Text>
            <Text>
              "For me" is where you'll find suggestions given to you.
            </Text>
          </Box>
        </Flex>
        <Flex align="center" gap={2}>
          <Box minW="120px">
            <FaBookReader size={25}/> <b>BOOK CLUBS</b>
          </Box>
          <Box>
            <Text>
              Create or join a book club. Public book clubs can be joined by anyone while private book clubs can only be joined by profile followers.
            </Text>
          </Box>
        </Flex>
        <Flex align="center" gap={2}>
          <Box minW="120px">
            <BsFillChatFill size={25}/> <b>CHAT ROOMS</b>
          </Box>
          <Box>
            <Text>
              Search for a book to join its live chat room. Be sure to check "Spoiler" if your chat message contains one.
            </Text>
          </Box>
        </Flex>
        <Flex align="center" gap={2}>
          <Box minW="120px">
            <ImStatsDots size={25}/> <b>STATS</b>
          </Box>
          <Box>
            <Text>
              Set reading goals and view analytics based on your reading/suggestion activities. Track how you rank amongst other users in the leaderboard section.
            </Text>
          </Box>
        </Flex>
      </Stack>
    </Box>
  )
}