import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  TableContainer,
  Divider,
  Select,
  Popover,
  PopoverHeader,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Spinner
} from "@chakra-ui/react";
import { ImInfo } from 'react-icons/im';
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import Cookies from "js-cookie";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";

export default function Leaderboard({server}: {server: string}) {
  dayjs.extend(utc);

  function getWeekStart(d: Date) {
    var day = d.getDay();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var milliseconds = d.getMilliseconds();
    var dateDiff = d.getDate() - day;
    var hoursDiff = d.getHours() - hours;
    var minutesDiff = d.getMinutes() - minutes;
    var secondsDiff = d.getSeconds() - seconds;
    var millisecondsDiff = d.getMilliseconds() - milliseconds;
    var newDate = new Date(d);
    newDate.setDate(dateDiff);
    newDate.setHours(hoursDiff);
    newDate.setMinutes(minutesDiff);
    newDate.setSeconds(secondsDiff);
    newDate.setMilliseconds(millisecondsDiff);
    return newDate;
  }
  const thisWeekStart = getWeekStart(new Date());
  
  const [allPagesReadLeaderboard,setAllPagesReadLeaderboard] = useState<any[]>([]);
  const [followingPagesReadLeaderboard,setFollowingPagesReadLeaderboard] = useState<any[]>([]);
  const [allPointsLeaderboard,setAllPointsLeaderboard] = useState<any[]>([]);
  const [followingPointsLeaderboard,setFollowingPointsLeaderboard] = useState<any[]>([]);
  const [weekStartRange,setWeekStartRange] = useState<any[]>([]);
  const [chosenWeekStart,setChosenWeekStart] = useState<string>("");
  const [isLoading,setIsLoading] = useState(false);
  async function getLeaderboard() {
    const tokenCookie = Cookies.get().token
    setIsLoading(true)
    await axios
      .get(`${server}/api/leaderboard`,
        {
          headers: {
            Authorization: tokenCookie
          },
          params: {
            chosenWeekStart: chosenWeekStart
          }
        })
        .then((response)=>{
          setAllPagesReadLeaderboard(response.data.message.allPagesRead)
          setFollowingPagesReadLeaderboard(response.data.message.followingPagesRead)
          setAllPointsLeaderboard(response.data.message.allPoints)
          setFollowingPointsLeaderboard(response.data.message.followingPoints)
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      setIsLoading(false)
  }

  useEffect(()=>{
    getLeaderboard()
    setWeekStartRange((prev:any)=>{
      let weekStart10Ago = dayjs(thisWeekStart).subtract(7 * 10,'day').toDate();
      if (thisWeekStart) {
        let weekStarts = [];
        const numWeeksBetween = dayjs(thisWeekStart).diff(dayjs(weekStart10Ago),'week');
        for (let i = 0; i < numWeeksBetween; i++) {
          weekStarts.push(dayjs(weekStart10Ago).add(7 * i, 'day').format());
        }
        return weekStarts
      }
      else {
        return [];
      }
    })
  },[chosenWeekStart])

  const PointsPopover = () => {
    return (
      <Popover isLazy>
        <PopoverTrigger>
          <Flex 
            pb={2}
            _hover={{
              cursor: "pointer"
            }}
          >
            <ImInfo size={16} color="gray" />
          </Flex>
        </PopoverTrigger>
        <PopoverContent width="auto">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Points</PopoverHeader>
          <PopoverBody 
            fontSize="sm"
            textTransform="none"
            _dark={{
              bg: "black"
            }}
          >
            <Flex justify="space-between" gap={2}>
              <Text>
                Page read
              </Text>
              <Text fontWeight="bold">
                2
              </Text>
            </Flex>
            <Flex justify="space-between" gap={2}>
              <Text>
                Poll vote
              </Text>
              <Text fontWeight="bold">
                100
              </Text>
            </Flex>
            <Flex justify="space-between" gap={2}>
              <Text>
                Poll vote won
              </Text>
              <Text fontWeight="bold">
                125
              </Text>
            </Flex>
            <Flex justify="space-between" gap={2}>
              <Text>
                Book Suggestion
              </Text>
              <Text fontWeight="bold">
                175
              </Text>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    )
  }
  
  return (
    <Box>
      {isLoading ? (
        <Flex align="center" justify="center" minH="80vh">
          <Spinner size="xl"/>
        </Flex>
      ): (
        <>
          {/* <Text fontWeight="bold" className="non-well" textAlign="center">
            {dayjs(thisWeekStart).format('M/D/YY')} - {dayjs(thisWeekStart).add(6,"day").format('M/D/YY')}
          </Text> */}
          {weekStartRange.length ? (
            <Flex justify="center">
              <Select
                width="auto"
                maxW="150px"
                size="md"
                defaultValue={chosenWeekStart}
                onChange={e=>setChosenWeekStart(e.target.value)}
              >
                <option value="">{dayjs(thisWeekStart).local().format('MM/DD/YYYY')}</option>
                {weekStartRange.map((p,i)=>{
                  return (
                    <option
                      key={i}
                      value={p}
                    >
                      {dayjs(p).local().format('MM/DD/YYYY')}
                    </option>
                  )
                }).reverse()}
              </Select>
            </Flex>
          ): null}
          <Heading as="h2" size="md" className="non-well">Top Readers</Heading>
          <Box className="well">
            <TableContainer>
              <Table variant='simple' size="sm">
                <Thead>
                  <Tr>
                    <Th>Pos.</Th>
                    <Th>Username</Th>
                    <Th display="flex" gap={2} align="center">Score <PointsPopover/></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {allPointsLeaderboard && allPointsLeaderboard.length ? (
                    allPointsLeaderboard.map((ap,i)=>{
                      const Flag = ap.country ? (countryFlagIconsReact as any)[ap.country] : null;
                      return (
                        <Tr key={i}>
                          <Td>
                            {i + 1}
                          </Td>
                          <Td>
                            <Flex 
                              as={Link}
                              to={`/profile/${ap.username}`}
                              align="center" 
                              gap={1}
                            >
                              <Avatar
                                size="xs"
                                src={`${ap.profile_photo}`}
                                border="2px solid gray"
                                name={`${ap.username}`}
                              >
                              </Avatar>
                              <Text>
                                @{ap.username}
                              </Text>
                              {Flag ? (
                                <Box w="1rem">
                                  <Flag title={ap.country + " flag"} />
                                </Box>
                              ): null}
                            </Flex>
                          </Td>
                          <Td>{ap.totalScore}</Td>
                        </Tr>
                      )
                    })
                  ): null}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
          {/* <Box className="well">
            <Heading as="h3" size="md" mb={2} >Pages Read</Heading>
            <TableContainer>
              <Table variant='simple' size="sm">
                <Thead>
                  <Tr>
                    <Th>Pos.</Th>
                    <Th>Username</Th>
                    <Th>Pages Read</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {allPagesReadLeaderboard && allPagesReadLeaderboard.length ? (
                    allPagesReadLeaderboard.map((apr,i)=>{
                      return (
                        <Tr key={i}>
                          <Td>
                            {i + 1}
                          </Td>
                          <Td>
                            <Flex 
                              as={Link}
                              to={`/profile/${apr.Profile.username}`}
                              align="center" 
                              gap={1}
                            >
                              <Avatar
                                size="xs"
                                src={`${apr.Profile.profile_photo}`}
                                border="2px solid gray"
                                name={`${apr.Profile.username}`}
                              >
                              </Avatar>
                              <Text>
                                @{apr.Profile.username}
                              </Text>
                            </Flex>
                          </Td>
                          <Td>{apr.read}</Td>
                        </Tr>
                      )
                    })
                  ): null}
                </Tbody>
              </Table>
            </TableContainer>
          </Box> */}
          <Divider mb={1} mt={4} />
          <Heading as="h2" size="md" className="non-well">Following</Heading>
          <Box 
            className="well" 
            sx={{
              marginBottom: ".5rem!important"
            }}
          >
            <TableContainer>
              <Table variant='simple' size="sm">
                <Thead>
                  <Tr>
                    <Th>Pos.</Th>
                    <Th>Username</Th>
                    <Th display="flex" gap={2} align="center">Score <PointsPopover/></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {followingPointsLeaderboard && followingPointsLeaderboard.length ? (
                    followingPointsLeaderboard.map((fp,i)=>{
                      const Flag = fp.country ? (countryFlagIconsReact as any)[fp.country] : null;
                      return (
                        <Tr key={i}>
                          <Td>
                            {i + 1}
                          </Td>
                          <Td>
                            <Flex 
                              as={Link}
                              to={`/profile/${fp.username}`}
                              align="center" 
                              gap={1}
                            >
                              <Avatar
                                size="xs"
                                src={`${fp.profile_photo}`}
                                border="2px solid gray"
                                name={`${fp.username}`}
                              >
                              </Avatar>
                              <Text>
                                @{fp.username}
                              </Text>
                              {Flag ? (
                                <Box w="1rem">
                                  <Flag title={fp.country + " flag"} />
                                </Box>
                              ): null}
                            </Flex>
                          </Td>
                          <Td>{fp.totalScore}</Td>
                        </Tr>
                      )
                    })
                  ): null}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
          <Box className="well">
            <TableContainer>
              <Table variant='simple' size="sm">
                <Thead>
                  <Tr>
                    <Th>Pos.</Th>
                    <Th>Username</Th>
                    <Th>Pages Read</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {followingPagesReadLeaderboard && followingPagesReadLeaderboard.length ? (
                    followingPagesReadLeaderboard.map((fpr,i)=>{
                      const Flag = fpr.country ? (countryFlagIconsReact as any)[fpr.country] : null;
                      return (
                        <Tr key={i}>
                          <Td>
                            {i + 1}
                          </Td>
                          <Td>
                            <Flex 
                              as={Link}
                              to={`/profile/${fpr.Profile.username}`}
                              align="center" 
                              gap={1} 
                            >
                              <Avatar
                                size="xs"
                                src={`${fpr.Profile.profile_photo}`}
                                border="2px solid gray"
                                name={`${fpr.Profile.username}`}
                              >
                              </Avatar>
                              <Text>
                                @{fpr.Profile.username}
                              </Text>
                              {Flag ? (
                                <Box w="1rem">
                                  <Flag title={fpr.country + " flag"} />
                                </Box>
                              ): null}
                            </Flex>
                          </Td>
                          <Td>{fpr.read}</Td>
                        </Tr>
                      )
                    })
                  ): null}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Box>
  )
}