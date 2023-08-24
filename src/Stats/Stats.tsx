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
  Select
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

export default function Stats({server}: {server: string}) {
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
    return Array.from(Array(7).keys()).map((idx) => {const d = new Date(aDate); d.setDate(d.getDate() - d.getDay() + idx); return d; });
  }

  function getWeekStart(d: Date) {
    var day = d.getDay();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var dateDiff = d.getDate() - day;
    var hoursDiff = d.getHours() - hours;
    var minutesDiff = d.getMinutes() - minutes;
    var newDate = new Date(d);
    newDate.setDate(dateDiff);
    newDate.setHours(hoursDiff);
    newDate.setMinutes(minutesDiff);
    return newDate;
  }
  const thisWeekStart = getWeekStart(new Date());
  
  const [suggestionRating,setSuggestionRating] = useState<number>(0);
  const [suggestionCount,setSuggestionCount] = useState<number>(0);

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
        setSuggestionCount(response.data.message.suggestionCount)

        setPagesRead((p)=>{
          const pR = getDaysOfTheWeekArray(pagesReadStartWeekDate ? new Date(pagesReadStartWeekDate) : new Date()).map((d)=>{
            if (
                response.data.message.pagesRead.find((pred:any)=>pred.date === dayjs(d).format('ddd MMM D YYYY'))
              ) {
              return response.data.message.pagesRead.find((pred:any)=>pred.date === dayjs(d).format('ddd MMM D YYYY'))
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
            const numWeeksBetween = dayjs(thisWeekStart).diff(dayjs(firstPagesRead),'week');
            for (let i = 0; i < numWeeksBetween; i++) {
              weekStarts.push(dayjs(firstPagesRead).add(7 * i, 'day').format());
            }
            console.log(firstPagesRead)
            console.log(dayjs(firstPagesRead).isUTC())
            console.log(dayjs(firstPagesRead).local())
            console.log(dayjs(firstPagesRead).local().isUTC())
            console.log(dayjs(firstPagesRead).utc())
            console.log(dayjs(firstPagesRead).utc().isUTC())
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
            const numWeeksBetween = dayjs(thisWeekStart).diff(dayjs(firstCurrentlyReading),'week');
            for (let i = 0; i < numWeeksBetween; i++) {
              weekStarts.push(dayjs(firstCurrentlyReading).add(7 * i, 'day').format());
            }
            return weekStarts
          }
          else {
            return [];
          }
        })

        setBookshelfBooksAdded((prev)=>{
          let bsba: any = []
          getDaysOfTheWeekArray(bookshelfBooksAddedStartWeekDate ? new Date(bookshelfBooksAddedStartWeekDate) : new Date()).forEach((d)=>{
            let count = 0;
            response.data.message.bookshelfBooksAdded.forEach((bsb: any)=>{
              if (new Date(bsb.created_on).toDateString() === d.toDateString()) {
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
            const numWeeksBetween = dayjs(thisWeekStart).diff(dayjs(firstBookshelfBook),'week');
            for (let i = 0; i < numWeeksBetween; i++) {
              weekStarts.push(dayjs(firstBookshelfBook).add(7 * i, 'day').format());
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
    <Box className="main-content-medium" pb={20}>
      <Heading as="h1" className="visually-hidden">Stats</Heading>
      <Flex
        align="center"
        justify="space-between"
        wrap="wrap"
      >
        {suggestionRating !== null ? (
          <Box
            className="well"
            minW="350px"
            flex="1 1 auto"
          >
            <Heading
              as="h2"
              size="md"
              mb={2}
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
                fontSize="xl"
              >
                {suggestionRating.toFixed(1)} stars
              </Text>
            </Flex>
          </Box>
        ): null}
        {suggestionCount !== null ? (
          <Box
            className="well"
            minW="350px"
            flex="1 1 auto"
          >
            <Heading
              as="h2"
              size="md"
              mb={2}
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
                fontSize="xl"
              >
                {suggestionCount}
              </Text>
            </Flex>
          </Box>
        ): null}
      </Flex>
      <Flex
        className="well"
        wrap="wrap"
        gap={5}
        position="relative"
      >
        {pagesReadDateRange.length ? (
          <Select
            position="absolute"
            top={1}
            left={1}
            width="auto"
            size="xs"
            onChange={e=>setPagesReadStartWeekDate(e.target.value)}
          >
            <option value="">{dayjs(thisWeekStart).format('MM/DD/YYYY')}</option>
            {pagesReadDateRange.map((p,i)=>{
              return (
                <option
                  key={i}
                  value={p}
                >
                  {dayjs(p).format('MM/DD/YYYY')}
                </option>
              )
            }).reverse()}
          </Select>
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
                as="h2"
                size="md"
                mb={2}
                textAlign="center"
                ml={[3,0]}
              >
                Pages Read
              </Heading>
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
                as="h2"
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
      {currentlyReadingPosts ? (
        <Flex
          justify="center"
          className="well"
          position="relative"
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
                as="h2"
                size="md"
                mb={2}
                textAlign="center"
                ml={[5,0]}
              >
                Books Read
              </Heading>
              {currentlyReadingPostsDateRange.length ? (
                <Select
                  position="absolute"
                  top={1}
                  left={1}
                  width="auto"
                  size="xs"
                  onChange={e=>setCurrentlyReadingPostsStartWeekDate(e.target.value)}
                >
                  <option value="">{dayjs(thisWeekStart).format('MM/DD/YYYY')}</option>
                  {currentlyReadingPostsDateRange.map((p,i)=>{
                    return (
                      <option
                        key={i}
                        value={p}
                      >
                        {dayjs(p).format('MM/DD/YYYY')}
                      </option>
                    )
                  }).reverse()}
                </Select>
              ): null}
              <Popover size="sm">
                <PopoverTrigger>
                  <Button
                    size="xs"
                    variant="ghost"
                  >
                    <ImInfo size={17} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Text textAlign="center" p={1}>
                    Currently Reading books posted
                  </Text>
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
      <Flex
        className="well"
        wrap="wrap"
        gap={5}
        position="relative"
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
                  as="h2"
                  size="md"
                  mb={2}
                  textAlign="center"
                  ml={[5,0]}
                >
                  Bookshelf Books
                </Heading>
                {bookshelfBooksAddedDateRange.length ? (
                  <Select
                    position="absolute"
                    top={1}
                    left={1}
                    width="auto"
                    size="xs"
                    onChange={e=>setBookshelfBooksAddedStartWeekDate(e.target.value)}
                  >
                    <option value="">{dayjs(thisWeekStart).format('MM/DD/YYYY')}</option>
                    {bookshelfBooksAddedDateRange.map((p,i)=>{
                      return (
                        <option
                          key={i}
                          value={p}
                        >
                          {dayjs(p).format('MM/DD/YYYY')}
                        </option>
                      )
                    }).reverse()}
                  </Select>
                ): null}
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
                  as="h2"
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
  )
}