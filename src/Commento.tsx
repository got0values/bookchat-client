import { Box, Heading } from "@chakra-ui/react"

export const Commento = ({server}: {server: string}) => {

  return (
    <Box>
      <Heading as="h1" size="xl" mb={5}>Commento</Heading>
      <Box>
        <script defer src="https://commento.communitybookclub.com/js/commento.js"></script>
        <div id="commento"></div>
      </Box>
    </Box>
  )
}