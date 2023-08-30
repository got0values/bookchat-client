import React, { useState, useRef, useEffect } from "react";
import { 
  Box,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import YourStats from "./YourStats";
import Leaderboard from "./Leaderboard";

export default function Stats({server}: {server: string}) {
  
  
  return (
    <Box className="main-content-medium" pb={20}>
      <Heading as="h1" className="visually-hidden">Stats</Heading>
      <Tabs
        variant="enclosed"
        px={2}
        isLazy
      >
        <TabList
          // borderBottom="none"
        >
          <Tab
            fontWeight="bold"
            _selected={{
              borderBottom: "2px solid gray"
            }}
            className="tab-button"
          >
            Leaderboard
          </Tab>
          <Tab
            fontWeight="bold"
            _selected={{
              borderBottom: "2px solid gray"
            }}
            className="tab-button"
          >
            Your Stats
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Leaderboard server={server}/>
          </TabPanel>
          <TabPanel px={0}>
            <YourStats server={server}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}