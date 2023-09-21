import React, { useState, useRef } from "react"
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
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";
import { BiDownload } from 'react-icons/bi';
import { GrClear } from 'react-icons/gr';
import transparentImage from '../assets/transparent-image.png';
import blackImage from '../assets/black-image.png';
import * as htmlToImage from 'html-to-image';
import axios from "axios";

export const QuoteDesigner = ({sharedTitle, sharedAuthor, bookImage}: {sharedTitle: string, sharedAuthor: string, bookImage: string}) => {
  const [quote,setQuote] = useState("Quote");
  const [textColor,setTextColor] = useState("#ffffff");
  const [textSize,setTextSize] = useState(25);
  const [textAlign,setTextAlign] = useState("center");
  const [bgLeft,setBgLeft] = useState("#267FF2");
  const [bgRight,setBgRight] = useState("#011C46");
  const [bgDarkness,setBgDarkness] = useState("0%");
  const [bgBlur,setBgBlur] = useState("0px");
  const [backgroundImage,setBackgroundImage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false)
  const [includeAuthor,setIncludeAuthor] = useState(true);
  const [includeTitle,setIncludeTitle] = useState(true);
  const [includeBookImage,setIncludeBookImage] = useState(false);
  const imageSearchRef = useRef({} as HTMLInputElement);

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
    // const bcnWatermark = document.getElementById("bcn-watermark");
    // bcnWatermark!.style.display = "block";
    htmlToImage.toPng(quoteBox!)
    .then(function (dataUrl) {
      // bcnWatermark!.style.display = "none";
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

  const { 
    isOpen: isOpenUnsplashModal, 
    onOpen: onOpenUnsplashModal, 
    onClose: onCloseUnsplashModal 
  } = useDisclosure()

  const [unsplashResults,setUnsplashResults] = useState([]);
  async function searchUnsplash() {
    const UNSPLASHAPI = import.meta.env.VITE_UNSPLASH_API_KEY;
    if (imageSearchRef.current.value !== "") {
      onOpenUnsplashModal()
      await axios
        .get(`https://api.unsplash.com/search/photos?query=${imageSearchRef.current.value}&per_page=20&page=1&client_id=${UNSPLASHAPI}`)
        .then((response)=>{
          setUnsplashResults(response.data.results)
        })
    }
  }
  
  return (
    <>
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
          sx={{
            aspectRatio: "1/0.6"
          }}
          // height={["300px","320px","320px"]}
          minHeight="100%"
          width={["350px","445px","615px"]}
          border="1px solid"
          borderColor="inherit"
          px={5}
          pb={10}
          pt={3}
          color={textColor}
          bgGradient={`linear(to-r, ${bgLeft}, ${bgRight})`}
          position="relative"
          backgroundImage={`linear-gradient(to right, ${bgLeft}, ${bgRight})`}
          backgroundSize="cover"
          backgroundPosition="center"
          rounded="lg"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            width="100%"
            height="100%"
            // opacity="80%"
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundImage={backgroundImage ? backgroundImage : "none"}
            filter={`blur(${bgBlur})`}
            zIndex={1}
          >
          </Box>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            width="100%"
            height="100%"
            backgroundSize="cover"
            backgroundPosition="center"
            opacity={`${bgDarkness}`}
            backgroundImage={blackImage}
            // filter={`brightness(${bgBrightness})`}
            zIndex={1}
          ></Box>
          <Text
            width="100%"
            fontSize={`${textSize}px`}
            fontWeight="bold"
            textAlign={textAlign as any}
            lineHeight={1.1}
            my="auto"
            zIndex={1}
          >
            {quote}
          </Text>
          <Box
            position="absolute"
            left={3}
            bottom={2}
            lineHeight={["1.1rem","1.4rem"]}
            zIndex={1}
          >
            <Flex gap={2}>
              {bookImage && !bookImage.includes("google.com") && includeBookImage ? (
                <ChakraImage
                  src={bookImage}
                  maxHeight="45px"
                  boxShadow="-1px 1px 5px #222222"
                />
              ): null}
              <Box lineHeight={1.4}>
                {includeTitle && sharedTitle ? (
                  <Text
                    fontStyle="italic"
                    fontWeight="900"
                    color="white"
                    textShadow="-1px 1px 2px black"
                    fontSize={[".65rem","1rem"]}
                  >
                    {sharedTitle ? sharedTitle : null}
                  </Text>
                ): null}
                {includeAuthor && sharedAuthor ? (
                  <Text
                    fontWeight="900"
                    color="white"
                    textShadow="-1px 1px 2px black"
                    fontSize={[".65rem","1rem"]}
                  >
                    {sharedAuthor}
                  </Text>
                ): null}
              </Box>
            </Flex>
          </Box>
          {/* <Box
            position="absolute"
            right={0}
            bottom={0}
            id="bcn-watermark"
            // display="none"
            backgroundColor="white"
            zIndex={1}
          >
            <Text
              fontSize=".7rem"
              fontWeight="bold"
              color="black"
              p={.5}
            >
              🐈‍ BookChatNoir.com
            </Text>
          </Box> */}
        </Flex>
        <Box 
          id="preview-div"
          mx="auto"
        ></Box>
        <FormControl variant="floatingstatic" mt={2}>
          <FormLabel>
            Quote
          </FormLabel>
          <Input
            type="text"
            onChange={e=>setQuote(prev=>e.target.value)}
            maxLength={500}
          />
        </FormControl>
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
                <SliderFilledTrack bgColor="gray" />
              </SliderTrack>
              <Tooltip
                hasArrow
                bg='teal.500'
                color='white'
                placement='top'
                isOpen={showTooltip}
                label={`${textSize}px`}
              >
                <SliderThumb bgColor="black" />
              </Tooltip>
            </Slider>
          </FormControl>
          <FormControl variant="floatingstatic" p={2} my={2}  flex="1 1 30%" mb={0}>
            <FormLabel>Text align</FormLabel>
            <RadioGroup 
              defaultValue={textAlign}
              onChange={e=>setTextAlign(e)}
              colorScheme="gray"
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
          <FormControl variant="floatingstatic" flex="1 1 15%">
            <FormLabel>Text</FormLabel>
            <Input
              type="color"
              py={2}
              defaultValue={textColor}
              onChange={e=>setTextColor(e.target.value)}
              aria-label='text color'
            />
          </FormControl>
        </Flex>
        <FormControl variant="floating">
          <FormLabel>
            Background Image
          </FormLabel>
          <Flex gap={1}>
            <Input 
              type="search"
              ref={imageSearchRef}
              onKeyUp={e=>e.key === 'Enter' ? searchUnsplash() : null}
            />
            <Button 
              onClick={e=>searchUnsplash()}
              variant="outline"
              borderColor="black"
              bgColor="white"
              color="black"
            >
              Search
            </Button>
            <Button
              onClick={e=>setBackgroundImage("")}
            >
              Clear
            </Button>
          </Flex>
        </FormControl>
        <Flex
          mt={2}
          align="center"
          gap={2}
          width="100%"
          wrap="wrap"
        >
            <Flex flex="1 0 250px" gap={2}>
            {backgroundImage ? (
              <FormControl variant="floatingstatic" flex="1 1 20%" p={2} my={2} mb={0}>
                <FormLabel>Bg Blur</FormLabel>
                <Slider 
                  aria-label='bg blur' 
                  min={0}
                  max={20}
                  step={1}
                  defaultValue={0}
                  onChange={e=>setBgBlur(`${e}px`)}
                >
                  <SliderTrack>
                    <SliderFilledTrack bgColor="gray" />
                  </SliderTrack>
                  <SliderThumb bgColor="black" />
                </Slider>
              </FormControl>
              ): null}
              <FormControl variant="floatingstatic" flex="1 1 20%" p={2} my={2} mb={0}>
                <FormLabel>Bg Darken</FormLabel>
                <Slider 
                  aria-label='bg darkness' 
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={0}
                  onChange={e=>setBgDarkness(`${e}%`)}
                >
                  <SliderTrack>
                    <SliderFilledTrack bgColor="gray" />
                  </SliderTrack>
                  <SliderThumb bgColor="black" />
                </Slider>
              </FormControl>
            </Flex>
          {!backgroundImage ? (
            <Flex flex="1 0 45%" gap={2}>
              <FormControl variant="floatingstatic" flex="1 1 20%">
                <FormLabel>Bg-left</FormLabel>
                <Input
                  type="color"
                  py={2}
                  defaultValue={bgLeft}
                  onChange={e=>setBgLeft(e.target.value)}
                  aria-label='left background color'
                />
              </FormControl>
              <FormControl variant="floatingstatic" flex="1 1 20%">
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
          ): null}
        </Flex>
        <Flex width="100%">
          
        </Flex>
        
        <Flex align="center" justify="space-between" width="100%">
          <Flex justify="space-between" wrap="wrap" gap={3}>
            {bookImage && !bookImage.includes("google.com") ? (
              <Checkbox
                isChecked={includeBookImage}
                onChange={e=>setIncludeBookImage(prev=>!prev)}
                colorScheme="gray"
              >
                Include Image
              </Checkbox>
            ): null}
            {sharedTitle ? (
              <Checkbox
                isChecked={includeAuthor}
                onChange={e=>setIncludeAuthor(prev=>!prev)}
                colorScheme="gray"
              >
                Include Author
              </Checkbox>
            ): null}
            {sharedAuthor ? (
              <Checkbox
                isChecked={includeTitle}
                onChange={e=>setIncludeTitle(prev=>!prev)}
                colorScheme="gray"
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

      <Modal 
        isOpen={isOpenUnsplashModal} 
        onClose={onCloseUnsplashModal}
        size="2xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Background Image
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody h="auto" maxH="75vh" overflow="auto">
            <Flex wrap="wrap" justify="center" gap={1}>
              {unsplashResults ? (
                unsplashResults.map((result:any,i:number)=>{
                  return (
                    <Box 
                      key={i}
                      position="relative"
                    >
                      <ChakraImage
                        src={result.urls.thumb}
                        onClick={e=>{
                          onCloseUnsplashModal();
                          setBackgroundImage(`url(${result.urls.regular})`)
                        }}
                        _hover={{
                          cursor: "pointer"
                        }}
                        alt={result.description}
                        title={result.description}
                      />
                      <Box
                        position="absolute"
                        top={1}
                        right={1}
                      >
                        <Text
                          fontSize="xs"
                          color="white"
                          textShadow="0px 1px 1px black"
                        >
                          Photo by <a href={result.user.links.html} target="blank">{result.user.first_name + " " + result.user.last_name}</a> on <a href={result.links.html} target="blank">Unsplash</a>
                        </Text>
                      </Box>
                    </Box>
                  )
                })
              ): null}
            </Flex>
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}