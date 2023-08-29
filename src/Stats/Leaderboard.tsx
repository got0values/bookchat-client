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
  Divider
} from "@chakra-ui/react";
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
  async function getLeaderboard() {
    const tokenCookie = Cookies.get().token
    await axios
      .get(`${server}/api/leaderboard`,
      {
        headers: {
          Authorization: tokenCookie
        }
      }
      )
      .then((response)=>{
        setAllPagesReadLeaderboard(response.data.message.allPagesRead)
        setFollowingPagesReadLeaderboard(response.data.message.followingPagesRead)
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.message)
      })
  }

  useEffect(()=>{
    getLeaderboard()
  },[])
  
  return (
    <Box>
      <Text fontWeight="bold" className="non-well" textAlign="center">
        {dayjs(thisWeekStart).format('M/D/YY')} - {dayjs(thisWeekStart).add(6,"day").format('M/D/YY')}
      </Text>
      <Heading as="h2" size="lg" className="non-well">All</Heading>
      <Box className="well">
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
      </Box>
      <Divider mb={1} mt={4} />
      <Heading as="h2" size="lg" className="non-well">Following</Heading>
      <Box className="well">
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
              {followingPagesReadLeaderboard && followingPagesReadLeaderboard.length ? (
                followingPagesReadLeaderboard.map((fpr,i)=>{
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
    </Box>
  )
}