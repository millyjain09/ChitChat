import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, selectedChat } = ChatState();

  return (
    <Box w="100%" h="100vh">
      {/* Top Navbar */}
      {user && <SideDrawer />}

      {/* Main Layout */}
      <Box
        display="flex"
        w="100%"
        h="91.5vh"
        p="10px"
        gap="10px"
      >
        {/* Sidebar / MyChats */}
        {user && (
          <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            w={{ base: "100%", md: "300px" }}
            minW={{ md: "280px" }}
            maxW={{ md: "320px" }}
            h="100%"
          >
            <MyChats fetchAgain={fetchAgain} />
          </Box>
        )}

        {/* Chat Area */}
        {user && (
          <Box
            display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
            flex="1"
            h="100%"
          >
            <Chatbox
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chatpage;
