import { 
  Image
} from "@chakra-ui/react";
import googlePreviewButton from '/src/assets/google_preview_button.gif';

export default function GooglePreviewLink({book} : any) {
  return (
    <a
      href={book.volumeInfo.previewLink}
      target="blank"
    >
      <Image
        src={googlePreviewButton}
        height="auto"
        maxWidth="60px"
      />
    </a>
  )
}