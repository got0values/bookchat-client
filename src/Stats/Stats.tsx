import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Box,
  Flex,
  Heading,
  Text
} from "@chakra-ui/react";
import StarRating from "../shared/StarRating";
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
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';

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
        console.log(response.data.message)
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
    <Box className="main-content" pb={20}>
      <Heading as="h1" className="visually-hidden">Stats</Heading>
      {suggestionRating ? (
        <Flex
          align="center"
          justify="center"
          gap={1}
        >
          <Text>
            Suggestion rating:
          </Text>
          <StarRating
            ratingCallback={null} 
            starRatingId={0}
            defaultRating={suggestionRating}
          />
          <Text fontWeight="bold">
            {suggestionRating.toFixed(1)} stars
          </Text>
        </Flex>
      ): null}
      {suggestionCount ? (
        <Flex
          align="center"
          justify="center"
          gap={1}
        >
          <Text>
            Suggestion count:
          </Text>
          <Text fontWeight="bold">
            {suggestionCount}
          </Text>
        </Flex>
      ): null}
      {pagesRead && pagesRead.length ? (
        <Flex
          justify="center"
          maxW="900px"
          mx="auto"
        >
          <Line 
            options={{
              responsive: true
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
        </Flex>
      ): null}


{/* reading.Profile.PagesRead?.map((p)=>p.pages_read).reduce((partialSum, a) => partialSum + a as number, 0) > 0 ? */}
    </Box>
  )
}