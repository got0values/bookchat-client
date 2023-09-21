import React, { useRef, useState } from "react";
import { 
  Box,
  Flex,
  Image,
  Button,
  Input,
  Divider,
  Checkbox
} from "@chakra-ui/react";
import { QuoteDesigner } from "./QuoteDesigner";

export default function ImageUpload({sharedTitle, sharedAuthor, bookImage, showQuoteDesigner,setShowQuoteDesigner}: {sharedTitle: string, sharedAuthor: string, bookImage: string, showQuoteDesigner: boolean, setShowQuoteDesigner?: React.Dispatch<any> | any}) {

  const currentlyReadingImageUploadRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const currentlyReadingImagePreviewRef = useRef<HTMLImageElement>({} as HTMLImageElement);
  const [currentlyReadingPreviewImage,setCurrentlyReadingPreviewImage] = useState("");
  const [currentlyReadingImageFile,setCurrentlyReadingImageFile] = useState<Blob | string | ArrayBuffer | null>(null);
  async function currentlyReadingImageChange(e: HTMLInputElement | any) {
    // currentlyReadingImagePreviewRef.current.style ? currentlyReadingImagePreviewRef.current.style.display = "block" : null;
    let targetFiles = e.target.files as FileList
    let previewImageFile = targetFiles[0];

    setCurrentlyReadingPreviewImage(URL.createObjectURL(previewImageFile))
    let blob = previewImageFile.slice(0,previewImageFile.size,"image/png")
    let newFile = new File([blob], previewImageFile.name, {type: "image/png"})
    setCurrentlyReadingImageFile(newFile)
  }

  return (
    <>
      {!currentlyReadingPreviewImage ? (
        <Box>
          <Checkbox
            isChecked={showQuoteDesigner}
            onChange={e=>setShowQuoteDesigner((prev: any)=>!prev)}
            fontWeight="bold"
          >
            Add a quote
          </Checkbox>

          {showQuoteDesigner ? (
            <>
              <QuoteDesigner 
                sharedTitle={sharedTitle} 
                sharedAuthor={sharedAuthor}
                bookImage={bookImage}
              />
              <Divider mt={3} />
            </>
          ): null}
        </Box>
      ): null}
      {!showQuoteDesigner ? (
        <Box mt={2}>
          {!currentlyReadingPreviewImage ? (
            <Button
              size="sm"
              backgroundColor="black"
              color="white"
              onClick={e=>currentlyReadingImageUploadRef.current.click()}
            >
              Add Image
              <Input
                type="file" 
                accept="image/png, image/jpeg"
                ref={currentlyReadingImageUploadRef}
                isRequired={true} 
                display="none"
                onChange={e=>currentlyReadingImageChange(e)}
              />
            </Button>
            ): (
            <Button
              size="sm"
              backgroundColor="tomato"
              color="white"
              onClick={e=>{
                setCurrentlyReadingPreviewImage("")
                setCurrentlyReadingImageFile(null)
              }}
            >
              Remove Image
            </Button>
          )}
          {currentlyReadingPreviewImage ? (
            <Flex 
              justify="center"
            >
              <Image 
                src={currentlyReadingPreviewImage ? currentlyReadingPreviewImage : ""} 
                ref={currentlyReadingImagePreviewRef}
                id="upload-image-preview"
                alt="profile preview image"
                maxH="400px"
              />
            </Flex>
          ) : (
            null
          )}
        </Box>
      ): null}
    </>
  )
}