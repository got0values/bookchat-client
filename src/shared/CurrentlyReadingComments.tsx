import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {CurrentlyReadingComment} from '../types/types';
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Avatar,
  Menu,
  MenuList,
  MenuButton,
  MenuItem
} from '@chakra-ui/react';
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { useAuth } from "../hooks/useAuth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";


const Comments: Function = ({comments}: {comments: CurrentlyReadingComment[]}) => {
  const navigate = useNavigate()
  const [increment,setIncrement] = useState(3);
  const {user} = useAuth();
  dayjs.extend(utc)

  return (
    comments.map((comment: CurrentlyReadingComment,i: number)=>{
      return (
        i >= increment ? (
          i === increment + 1 ? (
            <Box key={999} textAlign="center">
              <Button 
                onClick={e=>setIncrement(prev=>prev+3)}
                size="xs"
                w="auto"
                variant="ghost"
              >
                ...
              </Button>
            </Box>
          ) : <Box key={i}></Box>
        ) : (
          <Flex key={i} my={2}>
            <Box pe={2}>
              <Avatar
                onClick={e=>navigate(`/profile/${comment.Profile_CurrentlyReadingComment_commenter_idToProfile}`)} 
                size="md"
                cursor="pointer"
                src={comment.Profile_CurrentlyReadingComment_commenter_idToProfile.profile_photo}
                border="1px solid gray"
              />
            </Box>
            <Box w="100%">
              <Flex justify="space-between">
                <HStack>
                  <Text 
                    as={Link}
                    fontWeight="bold"
                    to={`/profile/${comment.Profile_CurrentlyReadingComment_commenter_idToProfile.username}`}
                  >
                    @{comment.Profile_CurrentlyReadingComment_commenter_idToProfile.username}
                  </Text>
                  <Text>{dayjs(comment.datetime).local().format('MMM DD, hh:mm a')}</Text>
                </HStack>
                {comment.Profile_CurrentlyReadingComment_commenter_idToProfile.id === user.Profile.id ? (
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="md"
                      variant="ghost"
                      rounded="full"
                      height="25px"
                    >
                      <BiDotsHorizontalRounded/>
                    </MenuButton>
                    <MenuList>
                      <MenuItem
                        color="tomato"
                        // onClick={e=>deleteReading(readBook.id)}
                        fontWeight="bold"
                        icon={<BiTrash size={20} />}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                ): <Box></Box>}
              </Flex>
              <Text>{comment.comment}</Text>
            </Box>
          </Flex>
        )
      )
    })
  )
}

export default Comments;