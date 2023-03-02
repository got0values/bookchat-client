import { Box, Heading } from "@chakra-ui/react"

export const Isso = ({server}: {server: string}) => {

  return (
    <Box>
      <Heading as="h1" size="xl" mb={5}>Isso</Heading>
      <Box>
        <Box id="thread-id">

        </Box>
      <script data-isso="/"
        data-isso-id="thread-id"
        data-isso-css="true"
        data-isso-css-url="null"
        data-isso-lang="ru"
        data-isso-max-comments-top="10"
        data-isso-max-comments-nested="5"
        data-isso-reveal-on-click="5"
        data-isso-avatar="true"
        data-isso-avatar-bg="#f0f0f0"
        data-isso-avatar-fg="#9abf88 #5698c4 #e279a3 #9163b6 ..."
        data-isso-vote="true"
        data-isso-vote-levels=""
        data-isso-page-author-hashes="f124cf6b2f01,7831fe17a8cd"
        data-isso-reply-notifications-default-enabled="false"
        src="https://isso.communitybookclub.com/js/embed.js"></script>
      </Box>
    </Box>
  )
}