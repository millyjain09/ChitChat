import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useHistory } from "react-router";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) history.push("/chats");
  }, [history]);

  return (
    // ✅ ADDED: h="100vh", display="flex", alignItems="center" 
    // Taaki ye page screen ke beech mein rahe, par Chatpage disturb na ho.
    <Box w="100%" h="100vh" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="xl">
        {/* Title Box */}
        <Box
          d="flex"
          justifyContent="center"
          p={3}
          w="100%"
          m="0 0 15px 0"
          borderRadius="lg"
          bg="rgba(255, 255, 255, 0.2)"
          backdropFilter="blur(10px)"
          border="1px solid rgba(255, 255, 255, 0.3)"
          boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
        >
          <Text fontSize="4xl" fontFamily="Work sans" fontWeight="bold" color="white" textShadow="0px 2px 4px rgba(0,0,0,0.3)">
            Chit-Chat
          </Text>
        </Box>

        {/* Forms Box */}
        <Box 
          w="100%" 
          p={4} 
          borderRadius="lg" 
          bg="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(15px)"
          border="1px solid rgba(255, 255, 255, 0.3)"
          boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        >
          <Tabs isFitted variant="soft-rounded">
            <TabList mb="1em">
              <Tab _selected={{ color: "white", bg: "rgba(0,0,0,0.3)" }} color="whiteAlpha.800" fontWeight="bold">Login</Tab>
              <Tab _selected={{ color: "white", bg: "rgba(0,0,0,0.3)" }} color="whiteAlpha.800" fontWeight="bold">Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel><Login /></TabPanel>
              <TabPanel><Signup /></TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
}

export default Homepage;