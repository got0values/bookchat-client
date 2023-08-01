import { 
  Flex,
  Button,
  useToast
} from "@chakra-ui/react";
import { 
  FacebookShareButton, 
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon
} from "react-share";
import { LiaCopySolid } from 'react-icons/lia';
import { BsArrowRightShort } from 'react-icons/bs';


export default function SocialShareButtons({reading,username}: {reading: any,username:string}) {
  const toast = useToast();

  return (
    <Flex
      align="center"
      gap={1}
    >
      <Button
        size="xs"
        variant="ghost"
        minW="unset"
        p={0}
        title="copy"
        onClick={e=>{
          navigator.clipboard.writeText(`Currently reading ${reading.title}${reading.published_date ? " (" + reading.published_date + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`)
          toast({
            description: `Copied text: "Currently reading ${reading.title}${reading.published_date ? " (" + reading.published_date + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}"`,
            status: "success",
            duration: 9000,
            isClosable: true
          })
        }}
      >
        <LiaCopySolid size={25} />
      </Button>
      <BsArrowRightShort size={20} />
      <FacebookShareButton 
        url={`https://app.bookchatnoir.com/profile/${username}`}
        quote={`Currently reading ${reading.title}${reading.published_date ? " (" + reading.published_date + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
      >
        <FacebookIcon size={25} round={true}/>
      </FacebookShareButton>
      <TwitterShareButton 
        url={`https://app.bookchatnoir.com/profile/${username}`}
        title={`Currently reading ${reading.title}${reading.published_date ? " (" + reading.published_date + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
      >
        <TwitterIcon size={25} round={true}/>
      </TwitterShareButton>
      <LinkedinShareButton 
        url={`https://app.bookchatnoir.com/profile/${username}`}
        title={`Currently reading ${reading.title}${reading.published_date ? " (" + reading.published_date + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
        summary={`Currently reading ${reading.title}${reading.published_date ? " (" + reading.published_date + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
        source={`https://app.bookchatnoir.com/profile/${username}`}
      >
        <LinkedinIcon size={25} round={true}/>
      </LinkedinShareButton>
      <WhatsappShareButton 
        title={`Currently reading ${reading.title}${reading.published_date ? " (" + reading.published_date + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
        url={`https://app.bookchatnoir.com/profile/${username}`}
      >
        <WhatsappIcon size={25} round={true}/>
      </WhatsappShareButton>
    </Flex>
  )
}