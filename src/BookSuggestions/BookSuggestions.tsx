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
import LatestSuggestions from "./BookSuggestionRatings";
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
          // borderBottom="none"
          overflowY="hidden"
          overflowX="auto"
          whiteSpace="nowrap"
        >
          <Tab 
            fontWeight="bold"
            className="tab-button"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            Bookshelves
          </Tab>
          <Tab 
            fontWeight="bold"
            className="tab-button"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            Ratings
          </Tab>
          <Tab 
            fontWeight="bold"
            className="tab-button"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            For me
          </Tab>
          <Tab 
            fontWeight="bold"
            className="tab-button"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            Archived
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