import { 
  Flex,
  Button,
  Text,
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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";


export const SocialSharePostButtons = ({reading,username}: {reading: any,username:string}) => {
  const toast = useToast();
  dayjs.extend(utc);

  return (
    <Flex
      align="center"
      gap={1}
    >
      <Text fontWeight="bold">
        Share
      </Text>
      <Button
        size="xs"
        variant="ghost"
        minW="unset"
        p={0}
        title="copy"
        onClick={e=>{
          navigator.clipboard.writeText(`Currently reading ${reading.title}${reading.published_date ? " (" + dayjs(reading.published_date).local().format('YYYY') + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`)
          toast({
            description: `Copied text: "Currently reading ${reading.title}${reading.published_date ? " (" + dayjs(reading.published_date).local().format('YYYY') + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}"`,
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
        quote={`Currently reading ${reading.title}${reading.published_date ? " (" + dayjs(reading.published_date).local().format('YYYY') + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
      >
        <FacebookIcon size={25} round={true}/>
      </FacebookShareButton>
      <TwitterShareButton 
        url={`https://app.bookchatnoir.com/profile/${username}`}
        title={`Currently reading ${reading.title}${reading.published_date ? " (" + dayjs(reading.published_date).local().format('YYYY') + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
      >
        <TwitterIcon size={25} round={true}/>
      </TwitterShareButton>
      <LinkedinShareButton 
        url={`https://app.bookchatnoir.com/profile/${username}`}
        title={`Currently reading ${reading.title}${reading.published_date ? " (" + dayjs(reading.published_date).local().format('YYYY') + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
        summary={`Currently reading ${reading.title}${reading.published_date ? " (" + dayjs(reading.published_date).local().format('YYYY') + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
        source={`https://app.bookchatnoir.com/profile/${username}`}
      >
        <LinkedinIcon size={25} round={true}/>
      </LinkedinShareButton>
      {/* <WhatsappShareButton 
        title={`Currently reading ${reading.title}${reading.published_date ? " (" + dayjs(reading.published_date).local().format('YYYY') + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
        url={`https://app.bookchatnoir.com/profile/${username}`}
      >
        <WhatsappIcon size={25} round={true}/>
      </WhatsappShareButton> */}
    </Flex>
  )
}

export default SocialSharePostButtons;

export const SocialShareNoPostButtons = ({username}: {username:string}) => {
  const toast = useToast();

  return (
    <Flex
      align="center"
      gap={1}
    >
      <Text fontWeight="bold">
        Share your profile
      </Text>
      <Button
        size="xs"
        variant="ghost"
        minW="unset"
        p={0}
        title="copy"
        onClick={e=>{
          navigator.clipboard.writeText(`Hey! Come check out my reading journey on Book Chat Noir: https://app.bookchatnoir.com/profile/${username}`)
          toast({
            description: `Copied text: "Hey! Come check out my reading journey on Book Chat Noir: https://app.bookchatnoir.com/profile/${username}"`,
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
        quote={`Copied text: "Hey! Come check out my reading journey on Book Chat Noir: https://app.bookchatnoir.com/profile/${username}`}
      >
        <FacebookIcon size={25} round={true}/>
      </FacebookShareButton>
      <TwitterShareButton 
        url={`https://app.bookchatnoir.com/profile/${username}`}
        title={`Copied text: "Hey! Come check out my reading journey on Book Chat Noir: https://app.bookchatnoir.com/profile/${username}`}
      >
        <TwitterIcon size={25} round={true}/>
      </TwitterShareButton>
      <LinkedinShareButton 
        url={`https://app.bookchatnoir.com/profile/${username}`}
        title={`Copied text: "Hey! Come check out my reading journey on Book Chat Noir: https://app.bookchatnoir.com/profile/${username}`}
        summary={`Copied text: "Hey! Come check out my reading journey on Book Chat Noir: https://app.bookchatnoir.com/profile/${username}`}
        source={`https://app.bookchatnoir.com/profile/${username}`}
      >
        <LinkedinIcon size={25} round={true}/>
      </LinkedinShareButton>
      {/* <WhatsappShareButton 
        title={`Currently reading ${reading.title}${reading.published_date ? " (" + dayjs(reading.published_date).local().format('YYYY') + ")" : null}${reading.author ? " by " + reading.author + " - Shared though bookchatnoir.com 🐈‍⬛" : null}`}
        url={`https://app.bookchatnoir.com/profile/${username}`}
      >
        <WhatsappIcon size={25} round={true}/>
      </WhatsappShareButton> */}
    </Flex>
  )
}