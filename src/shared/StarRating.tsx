import React, { useState } from "react";
import { StarRatingType } from "../types/types";
import { AiOutlineStar, AiFillStar } from "react-icons/ai"
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
        setRating(prev=>idx);
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
        variant="unstyled"
        onClick={e=>ratingCallback !== null ? onClick(idx) : null}
        _focus={{ outline: 0 }}
        _hover={{
          cursor: ratingCallback !== null ? "pointer" : "default"
        }}
      >
        <Icon
          as={fill ? AiFillStar : AiOutlineStar}
          size={25}
          height="20px"
          width="20px"
          m={0}
          p={0}
          name="star"
          color={fill ? "gold" : "gray"}
          onClick={e=>ratingCallback !== null ? onClick(fill) : null}
        />
      </Button>
    );
  };

  for (let i = 1; i <= 5; i++) {
    buttons.push(<RatingButton key={i} idx={i} fill={i <= rating ? 1 : 0} />);
  }

  return (
    <Flex 
      mt={0} 
      gap={0} 
    >
      <Input 
        name="rating" 
        type="hidden" 
        value={rating} 
      />
      {buttons}
    </Flex>
  );
}

export default StarRating;