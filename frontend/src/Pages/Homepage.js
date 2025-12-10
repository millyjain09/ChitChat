import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
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
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="xl"
        boxShadow="lg"
        borderWidth="0px" // Border hata kar shadow lagaya
      >
        <Text 
            fontSize="4xl" 
            fontFamily="Work sans" 
            fontWeight="bold"
            bgGradient="linear(to-r, blue.400, blue.600)" // Text Gradient
            bgClip="text"
            color="transparent"
        >
          Chit-Chat
        </Text>
      </Box>
      <Box 
        bg="white" 
        w="100%" 
        p={4} 
        borderRadius="xl" 
        boxShadow="2xl" // Deep shadow for premium look
        borderWidth="0px"
      >
        <Tabs isFitted variant="soft-rounded" colorScheme="blue">
          <TabList mb="1em">
            <Tab _selected={{ color: "white", bg: "blue.500" }}>Login</Tab>
            <Tab _selected={{ color: "white", bg: "blue.500" }}>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;