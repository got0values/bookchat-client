import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
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

  const daysOfTheWeekArray = Array.from(Array(7).keys()).map((idx) => {const d = new Date(); d.setDate(d.getDate() - d.getDay() + idx); return d; });
  
  const [suggestionRating,setSuggestionRating] = useState<number>(0);
  const [suggestionCount,setSuggestionCount] = useState<number>(0);
  const [pagesRead,setPagesRead] = useState<any[]>([]);
  const [currentlyReadingPosts,setCurrentlyReadingPosts] = useState<any[]>([]);
  const [bookshelfBooksAdded,setBookshelfBooksAdded] = useState<any[]>([]);
  async function getStats() {
    const tokenCookie = Cookies.get().token
    await axios
      .get(server + "/api/stats",
      {
        headers: {
          Authorization: tokenCookie
        }
      }
      )
      .then((response)=>{
        setSuggestionRating(response.data.message.suggestionRating)
        setSuggestionCount(response.data.message.suggestionCount)
        setPagesRead((p)=>{
          const pR = daysOfTheWeekArray.map((d)=>{
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
        setCurrentlyReadingPosts((cR)=>{
          let crp: any = []
          daysOfTheWeekArray.forEach((d)=>{
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
        setBookshelfBooksAdded((prev)=>{
          let bsba: any = []
          daysOfTheWeekArray.forEach((d)=>{
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
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.message)
      })
  }

  useEffect(()=>{
    getStats()
  },[])
  
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
              <Heading
                as="h2"
                size="md"
                mb={2}
                textAlign="center"
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
                Books Read
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