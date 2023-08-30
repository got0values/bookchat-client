import React, { useState, useRef, useEffect } from "react";
import { 
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  Divider,
  PopoverArrow
} from "@chakra-ui/react";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement, 
  Tooltip, 
  Legend, 
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler, } from 'chart.js';
import { Doughnut, Line, Bar, Chart } from 'react-chartjs-2';
import { ImInfo } from 'react-icons/im';
import { BsStarFill } from "react-icons/bs";
import { BookSuggestionPollVoteType } from "../types/types";

export default function YourStats({server}: {server: string}) {
  dayjs.extend(utc);

  ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Title, 
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    ArcElement, 
    Tooltip, 
    Legend
  );

  // const daysOfTheWeekArray = Array.from(Array(7).keys()).map((idx) => {const d = new Date(); d.setDate(d.getDate() - d.getDay() + idx); return d; });

  function getDaysOfTheWeekArray(aDate: Date) {
    return Array
    .from(Array(7).keys())
    .map((idx) => {
        const d = dayjs(aDate).local().toDate(); 
        d.setDate(d.getDate() - d.getDay() + idx); 
        return d; 
      });
  }

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
  
  const [suggestionRating,setSuggestionRating] = useState<number>(0);
  const [suggestionCount,setSuggestionCount] = useState<number>(0);
  const [suggestionRatingGiven,setSuggestionRatingGiven] = useState<number>(0)

  const [pollVotes,setPollVotes] = useState<BookSuggestionPollVoteType[]>([]);
;
  const [pagesRead,setPagesRead] = useState<any[]>([]);
  const [pagesReadDateRange,setPagesReadDateRange] = useState<any[]>([]);
  const [pagesReadStartWeekDate,setPagesReadStartWeekDate] = useState<string>("");

  const [currentlyReadingPosts,setCurrentlyReadingPosts] = useState<any[]>([]);
  const [currentlyReadingPostsDateRange,setCurrentlyReadingPostsDateRange] = useState<any[]>([]);
  const [currentlyReadingStartWeekDate,setCurrentlyReadingPostsStartWeekDate] = useState<string>("");

  const [bookshelfBooksAdded,setBookshelfBooksAdded] = useState<any[]>([]);
  const [bookshelfBooksAddedDateRange,setBookshelfBooksAddedDateRange] = useState<any[]>([]);
  const [bookshelfBooksAddedStartWeekDate,setBookshelfBooksAddedStartWeekDate] = useState<string>("");

  async function getStats() {
    const tokenCookie = Cookies.get().token
    await axios
      .get(`${server}/api/stats`,
      {
        headers: {
          Authorization: tokenCookie
        },
        params: {
          pagesReadStartWeekDate: pagesReadStartWeekDate,
          currentlyReadingStartWeekDate: currentlyReadingStartWeekDate,
          bookshelfBooksAddedStartWeekDate: bookshelfBooksAddedStartWeekDate
        }
      }
      )
      .then((response)=>{
        setSuggestionRating(response.data.message.suggestionRating)
        setSuggestionRatingGiven(response.data.message.suggestionRatingGiven)
        setSuggestionCount(response.data.message.suggestionCount)

        setPollVotes(response.data.message.pollVotes)

        setPagesRead((p)=>{
          const weekArray = getDaysOfTheWeekArray(pagesReadStartWeekDate ? dayjs(pagesReadStartWeekDate).local().toDate() : dayjs().local().toDate());
          const pR = weekArray.map((d,i)=>{
            if (
                response.data.message.pagesRead.find((pred:any)=>dayjs(pred.date.split("T")[0]).format('ddd MMM D YYYY') === dayjs(d).format('ddd MMM D YYYY'))
              ) {
              return response.data.message.pagesRead.find((pred:any)=>dayjs(pred.date.split("T")[0]).format('ddd MMM D YYYY') === dayjs(d).format('ddd MMM D YYYY'))
            }
            else {
              return (
                {
                  date: dayjs(d).format('ddd MMM D YYYY'),
                  read: 0
                }
              )
            }
          })
          return pR;
        })
        setPagesReadDateRange((prev: any)=>{
          let firstPagesRead = response.data.message.firstPagesRead;
          if (firstPagesRead) {
            let weekStarts = [];
            const numWeeksBetween = dayjs(thisWeekStart).diff(dayjs(firstPagesRead.split("T")[0]),'week');
            for (let i = 0; i < numWeeksBetween; i++) {
              weekStarts.push(dayjs(firstPagesRead.split("T")[0]).add(7 * i, 'day').format());
            }
            return weekStarts
          }
          else {
            return [];
          }
        })

        setCurrentlyReadingPosts((cR)=>{
          let crp: any = []
          getDaysOfTheWeekArray(currentlyReadingStartWeekDate ? new Date(currentlyReadingStartWeekDate) : new Date()).forEach((d)=>{
            let count = 0;
            response.data.message.currentlyReadingPosts.forEach((crpe: any)=>{
              if (new Date(crpe.created_on).toDateString() === d.toDateString()) {
                count++;
              }
            })
            crp.push({
              date: dayjs(d).format('ddd MMM D YYYY'),
              posts: count
            })
          })
          return crp;
        })
        setCurrentlyReadingPostsDateRange((prev)=>{
          let firstCurrentlyReading = response.data.message.firstCurrentlyReading;
          if (firstCurrentlyReading) {
            let weekStarts = [];
            const numWeeksBetween = dayjs(thisWeekStart).diff(dayjs(firstCurrentlyReading.split("T")[0]),'week');
            for (let i = 0; i < numWeeksBetween; i++) {
              weekStarts.push(dayjs(firstCurrentlyReading.split("T")[0]).add(7 * i, 'day').format());
            }
            return weekStarts
          }
          else {
            return [];
          }
        })

        setBookshelfBooksAdded((prev)=>{
          let bsba: any = []
          getDaysOfTheWeekArray(bookshelfBooksAddedStartWeekDate ? dayjs(bookshelfBooksAddedStartWeekDate).local().toDate() : dayjs().local().toDate()).forEach((d)=>{
            let count = 0;
            response.data.message.bookshelfBooksAdded.forEach((bsb: any)=>{
              if (dayjs(bsb.created_on.split("T")[0]).format('ddd MMM D YYYY') === dayjs(d).format('ddd MMM D YYYY')) {
                count++;
              }
            })
            bsba.push({
              date: dayjs(d).format('ddd MMM D YYYY'),
              books: count
            })
          })
          return bsba;
        })
        setBookshelfBooksAddedDateRange((prev)=>{
          let firstBookshelfBook = response.data.message.firstBookshelfBook;
          if (firstBookshelfBook) {
            let weekStarts = [];
            const numWeeksBetween = dayjs(thisWeekStart).diff(dayjs(firstBookshelfBook.split("T")[0]),'week');
            for (let i = 0; i < numWeeksBetween; i++) {
              weekStarts.push(dayjs(firstBookshelfBook.split("T")[0]).add(7 * i, 'day').format());
            }
            return weekStarts
          }
          else {
            return [];
          }
        })

      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.message)
      })
  }

  useEffect(()=>{
    getStats()
  },[pagesReadStartWeekDate,currentlyReadingStartWeekDate,bookshelfBooksAddedStartWeekDate])
  
  return (
    <Box>
      <Heading as="h2" size="lg" className="non-well">All-time</Heading>
      <Flex
        align="center"
        justify="space-between"
        wrap="wrap"
      >
        {suggestionCount !== null ? (
          <Box
            className="well"
            minW="300px"
            flex="1 1 45%"
            pb={5}
          >
            <Heading
              as="h3"
              size="md"
              mb={4}
              textAlign="center"
            >
              Suggestion Count
            </Heading>
            <Flex
              align="center"
              justify="center"
              gap={1}
            >
              <Text 
                fontWeight="bold"
                fontSize="lg"
              >
                {suggestionCount}
              </Text>
            </Flex>
          </Box>
        ): null}
        {suggestionRating !== null ? (
          <Box
            className="well"
            minW="300px"
            flex="1 1 45%"
            pb={5}
          >
            <Heading
              as="h3"
              size="md"
              mb={4}
              textAlign="center"
            >
              Suggestion Rating
            </Heading>
            <Flex
              align="center"
              justify="center"
              gap={1}
            >
              <BsStarFill fill="gold" size={30} />
              <Text 
                fontWeight="bold"
                fontSize="lg"
              >
                {suggestionRating.toFixed(1)} stars / {suggestionRatingGiven} ratings
              </Text>
            </Flex>
          </Box>
        ): null}
      </Flex>
      <Flex
        align="center"
        justify="space-between"
        wrap="wrap"
      >
        {pollVotes ? (
          <>
            <Box
              className="well"
              minW="300px"
              flex="1 1 45%"
              pb={5}
            >
              <Heading
                as="h3"
                size="md"
                mb={4}
                textAlign="center"
              >
                Poll Votes
              </Heading>
              <Flex
                align="center"
                justify="center"
                gap={1}
              >
                <Text 
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {pollVotes.length}
                </Text>
              </Flex>
            </Box>
            <Box
              className="well"
              minW="300px"
              flex="1 1 45%"
              pb={5}
            >
              <Heading
                as="h3"
                size="md"
                mb={4}
                textAlign="center"
              >
                Poll Votes Won
              </Heading>
              <Flex
                align="center"
                justify="center"
                gap={1}
              >
                <Text 
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {pollVotes.filter((vote)=>vote.won === 1).length}
                </Text>
              </Flex>
            </Box>
          </>
        ): null}
      </Flex>
      <Divider my={2} />
      <Heading as="h2" size="lg" className="non-well">Weekly</Heading>
      <Box className="well">
        {pagesReadDateRange.length ? (
          <Select
            width="auto"
            maxW="150px"
            size="xs"
            onChange={e=>setPagesReadStartWeekDate(e.target.value)}
          >
            <option value="">{dayjs(thisWeekStart).local().format('MM/DD/YYYY')}</option>
            {pagesReadDateRange.map((p,i)=>{
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
        ): null}
        <Flex
          wrap="wrap"
          gap={5}
        >
          {pagesRead && pagesRead.length ? (
            <Flex
              justify="center"
              width="350px"
              flex="1 1 auto"
            >
              <Box 
                height="100%"
                width="100%"
                maxW="100%"
              >
                <Flex gap={1} justify="center">
                  <Heading
                    as="h3"
                    size="md"
                    mb={2}
                    textAlign="center"
                    ml={[3,0]}
                  >
                    Pages Read
                  </Heading>
                  <Popover size="sm">
                    <PopoverTrigger>
                      <Button
                        size="xs"
                        variant="ghost"
                      >
                        <ImInfo size={17} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent p={2}>
                      <Box fontSize="sm">
                        <Text textAlign="center" p={1}>
                          Pages read within your Currently Reading posts.
                        </Text>
                        <Text textAlign="center" fontStyle="italic">
                          Tip: You can update any at any time to be included in the current week.
                        </Text>
                      </Box>
                      <PopoverArrow/>
                    </PopoverContent>
                  </Popover>
                </Flex>
                <Bar 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                  data={{
                    labels: pagesRead.map(p=>dayjs(p.date).format('M/D')),
                    datasets:[
                        {
                          label: "Pages read",
                          data: pagesRead.map((p)=>p.read),
                          borderColor: `rgba(9, 146, 200, 1)`,
                          backgroundColor: `rgba(23, 56, 200, 1)`,
                        }
                      ]
                  }}
                />
              </Box>
            </Flex>
          ): null}
          {pagesRead && pagesRead.length ? (
            <Flex
              justify="center"
              width="350px"
              flex="1 1 auto"
            >
              <Box 
                height="100%"
                width="100%"
                maxW="100%"
              >
                <Heading
                  as="h3"
                  size="md"
                  mb={2}
                  textAlign="center"
                >
                  Pages Read Increment
                </Heading>
                <Line 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                  data={{
                    labels: pagesRead.map(p=>dayjs(p.date).format('M/D')),
                    datasets:[
                        {
                          label: "Pages read",
                          data: pagesRead.map((p,i)=>{
                            if (i > 0) {
                              p.read = pagesRead[i - 1].read + p.read;
                            }
                            return p.read
                          }),
                          borderColor: `rgba(9, 146, 200, 1)`,
                          backgroundColor: `rgba(23, 56, 200, 1)`,
                        }
                      ]
                  }}
                />
              </Box>
            </Flex>
          ): null}
        </Flex>
      </Box>
      {currentlyReadingPosts ? (
        <Flex
          justify="center"
          className="well"
        >
          <Box 
            height="100%"
            width="100%"
            maxW="100%"
          >
            {currentlyReadingPostsDateRange.length ? (
              <Select
                width="auto"
                maxW="150px"
                size="xs"
                onChange={e=>setCurrentlyReadingPostsStartWeekDate(e.target.value)}
              >
                <option value="">{dayjs(thisWeekStart).local().format('MM/DD/YYYY')}</option>
                {currentlyReadingPostsDateRange.map((p,i)=>{
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
            ): null}
            <Flex 
              gap={1}
              align="bottom"
              justify="center"
            >
              <Heading
                as="h3"
                size="md"
                mb={2}
                textAlign="center"
                ml={[5,0]}
              >
                Currently Reading Books
              </Heading>
            </Flex>
            <Bar 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }} 
              data={{
                labels: currentlyReadingPosts.map(p=>dayjs(p.date).format('M/D')),
                datasets:[
                    {
                      label: "Posted",
                      data: currentlyReadingPosts.map((crp)=>crp.posts),
                      borderColor: `rgba(9, 146, 200, 1)`,
                      backgroundColor: `rgba(23, 56, 200, 1)`,
                    }
                  ]
              }}
            />
          </Box>
        </Flex>
      ): null}
      <Box className="well">
        {bookshelfBooksAddedDateRange.length ? (
          <Select
            width="auto"
            maxW="150px"
            size="xs"
            onChange={e=>setBookshelfBooksAddedStartWeekDate(e.target.value)}
          >
            <option value="">{dayjs(thisWeekStart).local().format('MM/DD/YYYY')}</option>
            {bookshelfBooksAddedDateRange.map((p,i)=>{
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
        ): null}
        <Flex
          wrap="wrap"
          gap={5}
        >
          {bookshelfBooksAdded ? (
            <Flex
              justify="center"
              width="350px"
              flex="1 1 auto"
            >
              <Box 
                height="100%"
                width="100%"
                maxW="100%"
              >
                <Flex 
                  gap={1}
                  align="bottom"
                  justify="center"
                >
                  <Heading
                    as="h3"
                    size="md"
                    mb={2}
                    textAlign="center"
                    ml={[5,0]}
                  >
                    Bookshelf Books
                  </Heading>
                </Flex>
                <Bar 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                  data={{
                    labels: bookshelfBooksAdded.map(b=>dayjs(b.date).format('M/D')),
                    datasets:[
                        {
                          label: "Added",
                          data: bookshelfBooksAdded.map((bsb)=>bsb.books),
                          borderColor: `rgba(9, 146, 200, 1)`,
                          backgroundColor: `rgba(23, 56, 200, 1)`,
                        }
                      ]
                  }}
                />
              </Box>
            </Flex>
          ): null}
          {bookshelfBooksAdded ? (
            <Flex
              justify="center"
              width="350px"
              flex="1 1 auto"
            >
              <Box 
                height="100%"
                width="100%"
                maxW="100%"
              >
                <Flex 
                  gap={1}
                  align="bottom"
                  justify="center"
                >
                  <Heading
                    as="h3"
                    size="md"
                    mb={2}
                    textAlign="center"
                  >
                    Bookshelf Books Increment
                  </Heading>
                </Flex>
                <Line 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                  data={{
                    labels: bookshelfBooksAdded.map(b=>dayjs(b.date).format('M/D')),
                    datasets:[
                        {
                          label: "Added",
                          data: bookshelfBooksAdded.map((bsb,i)=>{
                            if (i > 0) {
                              bsb.books = bookshelfBooksAdded[i - 1].books + bsb.books;
                            }
                            return bsb.books;
                          }),
                          borderColor: `rgba(9, 146, 200, 1)`,
                          backgroundColor: `rgba(23, 56, 200, 1)`,
                        }
                      ]
                  }}
                />
              </Box>
            </Flex>
          ): null}
        </Flex>
      </Box>
    </Box>
  )
}