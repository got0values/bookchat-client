import { 
  Image
} from "@chakra-ui/react";

export default function GooglePreviewLink({book} : any) {
  return (
    <a
      href={book.volumeInfo.infoLink}
      target="blank"
    >
      <Image
        src="/src/assets/google_preview_button.gif"
        height="auto"
        maxWidth="60px"
      />
    </a>
  )
}