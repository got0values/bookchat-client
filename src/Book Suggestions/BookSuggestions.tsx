import { 
  Box,
  Tabs, 
  TabList,
  Heading, 
  TabPanels, 
  Tab, 
  TabPanel
} from "@chakra-ui/react";
import { BookSuggestionToList } from "./BookSuggestToList";
import { BookSuggestionsForMe } from "./BookSuggestionsForMe";
import { BookSuggestionsArchive } from "./BookSuggestionsArchive";
import LatestSuggestions from "./LatestSuggestions";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";


export default function BookSuggestions({server, gbooksapi}: {server: string; gbooksapi: string;}) {
  dayjs.extend(utc);

  

  return (
    <Box className="main-content-smaller">
      <Heading as="h1" className="visually-hidden">Book Suggestions</Heading>
      <Tabs 
        variant="enclosed"
        p={2}
        isLazy
      >
        <TabList
          borderBottom="none"
        >
          <Tab 
            fontWeight="bold"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            Suggest
          </Tab>
          <Tab 
            fontWeight="bold"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            Latest
          </Tab>
          <Tab 
            fontWeight="bold"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            For Me
          </Tab>
          <Tab 
            fontWeight="bold"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            Archive
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            
            <BookSuggestionToList server={server} />

          </TabPanel>
          <TabPanel px={0}>
            
            <LatestSuggestions server={server} />

          </TabPanel>
          <TabPanel px={0}>
            

            <BookSuggestionsForMe server={server} />


          </TabPanel>
          <TabPanel px={0}>
            

            <BookSuggestionsArchive server={server} />


          </TabPanel>

        </TabPanels>
      </Tabs>
    </Box>
  )
}