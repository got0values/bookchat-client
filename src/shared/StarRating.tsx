import React, { useState } from "react";
import { StarRatingType } from "../types/types";
import { BsStarFill, BsStar, BsStarHalf } from "react-icons/bs";
import { Icon, Button, Flex, Input } from "@chakra-ui/react";

const StarRating = ({ratingCallback, starRatingId, defaultRating}: StarRatingType) => {
  const [rating, setRating] = useState(defaultRating);
  const buttons = [];

  const onClick = (idx: number) => {
    if (!isNaN(idx) && ratingCallback !== null) {
      if (rating === 1 && idx === 1) {
        setRating(prev=>0);
        ratingCallback([0,starRatingId])
      } else {
        setRating(prev=>{
          let clickedRating = idx;
          if (prev % 1 === 0.5) {
            clickedRating =  Math.ceil(idx)
          }
          else {
            clickedRating =  idx - .5;
          }
          idx = clickedRating;
          return clickedRating;
        });
        ratingCallback([idx,starRatingId])
      }
    }
  };

  const RatingButton = ({ idx, fill }: {idx: number, fill: number}) => {
    return (
      <Button
        aria-label={`Rate ${idx}`}
        size="xs"
        p={0}
        m={0}
        ml={-1}
        variant="unstyled"
        onClick={e=>ratingCallback !== null ? onClick(idx) : null}
        _focus={{ outline: 0 }}
        _hover={{
          cursor: ratingCallback !== null ? "pointer" : "default"
        }}
      >
        <Icon
          as={fill === 1 ? BsStarFill : fill === .5 ? BsStarHalf : BsStar}
          size={25}
          height="17px"
          width="17px"
          m={0}
          mb={-.5}
          p={0}
          name="star"
          color={fill ? "gold" : "gray"}
          // onClick={e=>ratingCallback !== null ? onClick(fill) : null}
        />
      </Button>
    );
  };

  for (let i = 1; i <= 5; i++) {
    buttons.push(
    <RatingButton 
      key={i} 
      idx={i} 
      fill={i <= rating ? 1 : i > Math.ceil(rating) ? 0 : rating % 1 >= .5 ? .5 : 0} 
    />
    );
  }

  return (
    <Flex 
      mt={0} 
      gap={0} 
    >
      <Input 
        name="rating" 
        type="hidden" 
        data-id={starRatingId}
        value={rating ? rating : ""} 
      />
      {buttons}
    </Flex>
  );
}

export default StarRating;