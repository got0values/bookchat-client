import React, { useState, useRef, useEffect } from "react";
import { 
  Box,
  Flex,
  HStack,
  Heading
} from "@chakra-ui/react";
import { TikTokEmbed, InstagramEmbed, TwitterEmbed } from 'react-social-media-embed';
import { Timeline } from 'react-twitter-widgets';
import Cookies from "js-cookie";
import axios from "axios";
import { load } from "cheerio";

export default function SocialsTab({server}: {server: string}) {
  const twitterkLinks = [
    "lithub",
    "The_Millions",
    "BookRiot",
    "simonschuster"
  ];
  const igLinks = [
    "https://www.instagram.com/p/Cx_Dq_8rwa5/",
    "https://www.instagram.com/p/CyAa-XngLMx/",
    "https://www.instagram.com/p/Cx_txRVrbwp/",
    "https://www.instagram.com/p/CyAZATGI1xo/",
    "https://www.instagram.com/reel/CyAX36poNim/",
    "https://www.instagram.com/p/Cx_y6nwrpBV/",
    "https://www.instagram.com/p/Cx_tHMQPz6Q/"
  ];
  const tikTokLinks = [
    "https://www.tiktok.com/@user777_hopeless/video/7188655607484796202",
    "https://www.tiktok.com/@arab3l1a/video/7265081307078692138",
    "https://www.tiktok.com/@toriro50/video/7277630412837440800",
    "https://www.tiktok.com/@lxvii7/video/7276486491813989664",
    "https://www.tiktok.com/@darkloveseriesworld/video/7244907003959725313",
    "https://www.tiktok.com/@vanislgal1/video/7261771780711386374",
    "https://www.tiktok.com/@jasf4iry/video/7219193515518020882",
    "https://www.tiktok.com/@aelin.superemcy/video/7271835411436129582"
  ];

  // const [igFeed,setIgFeed] = useState([]);
  // async function getIgFeed() {
  //   const tokenCookie: string | null = Cookies.get().token;
  //   await axios
  //   .get(server + "/api/urlfetch",
  //   {
  //     headers: {
  //       Authorization: tokenCookie
  //     },
  //     params: {
  //       url: "https://instagram.com/bookchatnoir"
  //     }
  //   })
  //   .then((response)=>{
  //     const igPage = response.data.message;
  //     let $ = load(igPage)
  //     console.log($("main"))
  //     // setIgFeed(response.data)
  //   })
  //   .catch((response)=>{
  //     console.log(response)
  //   })
  // }

  // useEffect(()=>{
  //   getIgFeed()
  // },[])

  return (
    <Flex
      direction="column"
      gap={5}
    >
      <Box>
        <Heading as="h2" size="md">
          Twitter
        </Heading>
        <HStack
          spacing={4}
          overflowX="auto"
          align="flex-start"
        >
          {twitterkLinks.map((t,i)=>{
            return (
              <Box 
                flexShrink="0"
                flexBasis="300px"
                key={i}
              >
                <Timeline
                  dataSource={{
                    sourceType: 'url',
                    url: `https://twitter.com/${t}`
                  }}
                  options={{
                    height: '400'
                  }}
                />
              </Box>
            )
          })}
        </HStack>
      </Box>

      <Box>
        <Heading as="h2" size="md">
          Instagram
        </Heading>
        <HStack
          spacing={4}
          overflowX="auto"
          align="flex-start"
          maxH="700px"
          overflowY="hidden"
        >
          {igLinks.map((i,j)=>{
            return (
              <Box 
                flexShrink="0"
                key={j}
              >
                <InstagramEmbed url={i} width={325} />
              </Box>
            )
          })}
        </HStack>
      </Box>

      {/* <Box>
        <Heading as="h2" size="md">
          TikTok
        </Heading>
        <HStack
          spacing={4}
          overflowX="auto"
          align="flex-start"
        >
          {tikTokLinks.map((t,i)=>{
            return (
              <Box 
                flexShrink="0"
                key={i}
              >
                <TikTokEmbed url={t} width={325} />
              </Box>
            )
          })}
        </HStack>
      </Box> */}
    </Flex>
  )
}