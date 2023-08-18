import { useState } from "react";
import { 
  Box,
  Flex,
  Divider,
  Image,
  Heading,
  Text
} from "@chakra-ui/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

export default function FeaturedBooks() {

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    // adaptiveHeight: true,
    centerMode: true,
    // centerPadding: '100px'
  };

  const sections = [
    {
      heading: "New",
      books: [
        {
          src: "https://images-us.bookshop.org/ingram/9780374610074.jpg?height=250&v=v2-5f5cd59aa37a8bb9ef5db5c71514eb62",
          href: "https://bookshop.org/a/95292/9780374610074"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780593422946.jpg?height=500&v=v2",
          href: "https://bookshop.org/a/95292/9780593422946"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9781982179007.jpg?height=500&v=v2-66a085d972b2a565df4269ccaf7b0223",
          href: "https://bookshop.org/a/95292/9781982179007"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780802162021.jpg?height=500&v=v2-52e8404e8d5707d81b34288e70dd51a2",
          href: "https://bookshop.org/a/95292/9780802162021"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780593496268.jpg?height=500&v=v2-e4ba0f82e5e6c91af09caa637fee6ad2",
          href: "https://bookshop.org/a/95292/9780593496268"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9781250860026.jpg?height=500&v=v2-6833255c2e9f1daca51c9b31678b8909",
          href: "https://bookshop.org/a/95292/9781250860026"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780062951847.jpg?height=500&v=v2-b63e0db22976a428eef63a403efb6548",
          href: "https://bookshop.org/a/95292/9780062951847"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9781668006498.jpg?height=250&v=v2-ec02abd63ccb08900c0699da9a855d09",
          href: "https://bookshop.org/a/95292/9781668006498"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780593449431.jpg?height=250&v=v2-b056c8ca0ab5871de7e91dc6a82a4b07",
          href: "https://bookshop.org/a/95292/9780593449431"
        }
      ]
    },
    {
      heading: "Popular",
      books: [
        {
          src: "https://images-us.bookshop.org/ingram/9780593652961.jpg?height=250&v=v2-fe060aff00cc71f7b7c0e2c96a595785",
          href: "https://bookshop.org/a/95292/9780593652961"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780593597613.jpg?height=250&v=v2-c1ff97d3c987c55384a1196070b99de6",
          href: "https://bookshop.org/a/95292/9780593597613"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780744079074.jpg?height=250&v=v2-da93e8f9a9a6d8a4320c20dbe3979ba9",
          href: "https://bookshop.org/a/95292/9780744079074"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780063327528.jpg?height=250&v=v2-48d3a7f5423e21fb6179e1aa16c76f75",
          href: "https://bookshop.org/a/95292/9780063327528"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780593441282.jpg?height=250&v=v2-4ddc4c5a83c00138ecb7c24016e85ae6",
          href: "https://bookshop.org/a/95292/9780593441282"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9781638930563.jpg?height=250&v=v2-f067447c2622e241dda14d27f16d3cff",
          href: "https://bookshop.org/a/95292/9781638930563"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9781668020722.jpg?height=250&v=v2-828ec718503e744f33e674a9f0e41167",
          href: "https://bookshop.org/a/95292/9781668020722"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780812998627.jpg?height=250&v=v2-3a8c68be410642dc0815c0c31b4c0408",
          href: "https://bookshop.org/a/95292/9780812998627"
        },
        {
          src: "https://images-us.bookshop.org/ingram/9780062825230.jpg?height=250&v=v2-a7bef67bbd40f2d485af75c182fd2dc2",
          href: "https://bookshop.org/a/95292/9780062825230"
        },
      ]
    }
  ]
  
  return (
    <>
      <Text 
        className="non-well" 
        fontSize="sm" 
        fontStyle="italic"
        sx={{
          mt: "0px!important"
        }}
      >
        Updated August 9th, 2023
      </Text>
      {sections.map((section,i)=>{
        return (
          <Box
            className="well"
            sx={{
              mb: ".6rem!important"
            }}
            key={i}
          >
            <Heading
              as="h2"
              size="md"
            >
              {section.heading}
            </Heading>
            <Divider mt={2} mb={3} />
            <Box
              // maxW="500px"
              px={2}
              pb={8}
            >
              <Slider {...settings}>
                {section.books.map((book,j)=>{
                  return (
                    <Box key={j}>
                      <Box
                        as="a"
                        href={book.href}
                        target="blank"
                      >
                        <Image
                          src={book.src}
                          p={.5}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Slider>
            </Box>
          </Box>
        )
      })}
    </>
  )
}