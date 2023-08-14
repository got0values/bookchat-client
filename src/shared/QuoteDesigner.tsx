import React, { useState } from "react"
import { SelectedBook } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Flex,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Button,
  Image as ChakraImage,
  Checkbox
} from "@chakra-ui/react";
import { BiDownload } from 'react-icons/bi';
import { GrClear } from 'react-icons/gr';
import * as htmlToImage from 'html-to-image';

export const QuoteDesigner = ({sharedTitle, sharedAuthor, bookImage}: {sharedTitle: string, sharedAuthor: string, bookImage: string}) => {
  const [quote,setQuote] = useState("Quote");
  const [textColor,setTextColor] = useState("#ffffff");
  const [textSize,setTextSize] = useState(25);
  const [textAlign,setTextAlign] = useState("center");
  const [bgLeft,setBgLeft] = useState("#104080");
  const [bgRight,setBgRight] = useState("#f3f659");
  const [showTooltip, setShowTooltip] = useState(false)
  const [includeAuthor,setIncludeAuthor] = useState(true);
  const [includeTitle,setIncludeTitle] = useState(true);
  const [includeBookImage,setIncludeBookImage] = useState(false);

  function downloadImage() {
    const quoteBox = document.getElementById('quote-box');
    const bcnWatermark = document.getElementById("bcn-watermark");
    bcnWatermark!.style.display = "block";
    htmlToImage.toPng(quoteBox!)
    .then(function (dataUrl) {
      var img = new Image();
      img.src = dataUrl;
      bcnWatermark!.style.display = "none";
      const link = document.createElement("a");
      link.href = dataUrl;
      link.style.display = "none";
      link.download = "quoteImage.png";
      link.click()
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error);
    });
  }

  function previewImage() {
    const quoteBox = document.getElementById('quote-box');
    const bcnWatermark = document.getElementById("bcn-watermark");
    bcnWatermark!.style.display = "block";
    htmlToImage.toPng(quoteBox!)
    .then(function (dataUrl) {
      bcnWatermark!.style.display = "none";
      var img = new Image();
      img.src = dataUrl;
      const previewDiv = document.getElementById("preview-div")
      previewDiv!.innerHTML = "";
      previewDiv!.appendChild(img);
      const clearPreviewButton = document.getElementById("clear-preview-button");
      clearPreviewButton!.style.display = "block";
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error);
    });
  }

  function clearPreviewImage() {
    const previewDiv = document.getElementById("preview-div")
    previewDiv!.innerHTML = "";
    const clearPreviewButton = document.getElementById("clear-preview-button");
    clearPreviewButton!.style.display = "none";
  }
  
  return (
    <Flex
      mt={3}
      direction="column"
      align="center"
      gap={2}
      width="100%"
      minWidth="325px"
    >
      <Flex
        id="quote-box"
        direction="column"
        align="center"
        justify="center"
        height={["300px","320px","320px"]}
        minHeight="100%"
        width={["300px","445px","615px"]}
        // mx="auto"
        border="1px solid"
        borderColor="inherit"
        // rounded="md"
        p={5}
        pb={10}
        color={textColor}
        bgGradient={`linear(to-r, ${bgLeft}, ${bgRight})`}
        position="relative"
      >
        <Text
          as="h3"
          width="100%"
          fontSize={`${textSize}px`}
          fontWeight="bold"
          textAlign={textAlign as any}
          my="auto"
        >
          {quote}
        </Text>
        <Box
          position="absolute"
          left={3}
          bottom={2}
          lineHeight="1.2rem"
        >
          <Flex gap={1}>
            {bookImage && !bookImage.includes("google.com") && includeBookImage ? (
              <ChakraImage
                src={bookImage}
                maxHeight="45px"
                boxShadow="-1px 1px 5px #222222"
              />
            ): null}
            <Box>
              {includeTitle && sharedTitle ? (
                <Text
                  fontStyle="italic"
                  fontSize=".9rem"
                  fontWeight="900"
                  color="white"
                  textShadow="-1px 1px 2px black"
                >
                  {sharedTitle ? sharedTitle : null}
                </Text>
              ): null}
              {includeAuthor && sharedAuthor ? (
                <Text
                  fontSize=".9rem"
                  fontWeight="900"
                  color="white"
                  textShadow="-1px 1px 2px black"
                >
                  {sharedAuthor}
                </Text>
              ): null}
            </Box>
          </Flex>
        </Box>
        <Box
          position="absolute"
          right={0}
          bottom={0}
          id="bcn-watermark"
          // display="none"
          backgroundColor="white"
        >
          <Text
            fontSize=".7rem"
            fontWeight="bold"
            color="black"
            p={.5}
          >
            🐈‍⬛ BookChatNoir.com
          </Text>
        </Box>
      </Flex>
      <Box 
        id="preview-div"
        mx="auto"
      ></Box>
      <FormControl variant="floating">
        <FormLabel>
          Quote
        </FormLabel>
        <Input
          type="text"
          onChange={e=>setQuote(prev=>e.target.value)}
          maxLength={500}
        />
      </FormControl>
      <Flex
        mt={2}
        align="center"
        gap={2}
        width="100%"
      >
        <FormControl variant="floatingstatic">
          <FormLabel>Text</FormLabel>
          <Input
            type="color"
            py={2}
            defaultValue={textColor}
            onChange={e=>setTextColor(e.target.value)}
            aria-label='text color'
          />
        </FormControl>
        <FormControl variant="floatingstatic">
          <FormLabel>Bg-left</FormLabel>
          <Input
            type="color"
            py={2}
            defaultValue={bgLeft}
            onChange={e=>setBgLeft(e.target.value)}
            aria-label='left background color'
          />
        </FormControl>
        <FormControl variant="floatingstatic">
          <FormLabel>Bg-right</FormLabel>
          <Input
            type="color"
            py={2}
            defaultValue={bgRight}
            onChange={e=>setBgRight(e.target.value)}
            aria-label='right background color'
          />
        </FormControl>
      </Flex>
      <Flex align="center" justify="space-between" wrap="wrap" width="100%">
        <FormControl variant="floatingstatic" p={2} my={2} flex="1 1 50%" mb={0}>
          <FormLabel>Text size</FormLabel>
          <Slider 
            aria-label='text size' 
            onMouseEnter={()=>setShowTooltip(true)}
            onMouseLeave={()=>setShowTooltip(false)}
            min={10}
            max={75}
            step={1}
            defaultValue={textSize}
            onChange={e=>setTextSize(e)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg='teal.500'
              color='white'
              placement='top'
              isOpen={showTooltip}
              label={`${textSize}px`}
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
        </FormControl>
        <FormControl variant="floatingstatic" p={2} my={2}  flex="1 1 30%" mb={0}>
          <FormLabel>Text align</FormLabel>
          <RadioGroup 
            defaultValue={textAlign}
            onChange={e=>setTextAlign(e)}
          >
            <Stack spacing={1} direction="row" justify="space-between">
              <Radio value="left">
                Left
              </Radio>
              <Radio value="center">Center</Radio>
              <Radio value="end">End</Radio>
            </Stack>
        </RadioGroup>
        </FormControl>
      </Flex>
      <Flex align="center" justify="space-between" width="100%">
        <Flex justify="space-between" wrap="wrap" gap={3}>
          {bookImage && !bookImage.includes("google.com") ? (
            <Checkbox
              isChecked={includeBookImage}
              onChange={e=>setIncludeBookImage(prev=>!prev)}
            >
              Include Image
            </Checkbox>
          ): null}
          {sharedTitle ? (
            <Checkbox
              isChecked={includeAuthor}
              onChange={e=>setIncludeAuthor(prev=>!prev)}
            >
              Include Author
            </Checkbox>
          ): null}
          {sharedAuthor ? (
            <Checkbox
              isChecked={includeTitle}
              onChange={e=>setIncludeTitle(prev=>!prev)}
            >
              Include Title
            </Checkbox>
          ): null}
        </Flex>
        <Flex gap={1}>
          <Button
            variant="outline"
            backgroundColor="white"
            color="black"
            size="sm"
            onClick={e=>clearPreviewImage()}
            id="clear-preview-button"
            title="clear preview"
            display="none"
          >
            <GrClear/>
          </Button>
          <Button
            variant="outline"
            backgroundColor="white"
            color="black"
            size="sm"
            onClick={e=>previewImage()}
            title="preview"
          >
            Preview
          </Button>
          <Button
            backgroundColor="black"
            color="white"
            size="sm"
            onClick={e=>downloadImage()}
            title="download"
          >
            <BiDownload/>
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}