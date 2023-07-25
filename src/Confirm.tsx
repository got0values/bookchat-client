import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Box,
  Flex,
  Button,
  Heading,
  Text,
} from "@chakra-ui/react";
import axios from "axios";

export default function Confirm({server}: {server: string}) {
  const [searchParams] = useSearchParams();

  const [confirmed,setConfirmed] = useState(false);
  async function putConfirm() {
    const userId = searchParams.get("bcu") as string
    await axios
      .put(server + "/api/confirm", {
        userId: parseInt(userId)
      })
      .then((response)=>{
        if (response.data.success){
          setConfirmed(true)
        }
        else {
          setConfirmed(false)
        }
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.message)
      })
  }

  useEffect(()=>{
    putConfirm()
  },[putConfirm])

  return (
    <Flex direction="column" gap={5} align="center" justify="center" minH="90vh">
      <Heading as="h2" size="lg">
        {confirmed ? "Confirmed" : "Error confirming account"}
      </Heading>
      <Text>
        {confirmed ? (
          <Button
            as={Link}
            to="/login"
          >
            Login
          </Button>
        ) : (
          null
        )}
      </Text>
    </Flex>
  );
};
