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
    <div style={{ width: "100%" }}>
      
      {/* Hide SideDrawer on mobile when chat is open */}
      {user && (
        <Box display={{ base: selectedChat ? "none" : "block", md: "block" }}>
          <SideDrawer />
        </Box>
      )}

      <Box
        d="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {/* My Chats – hide on mobile when chat is open */}
        {user && (
          <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            w={{ base: "100%", md: "31%" }}
          >
            <MyChats fetchAgain={fetchAgain} />
          </Box>
        )}

        {/* Chat Box – full screen on mobile when chat is open */}
        {user && (
          <Box
            display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
            w={{ base: "100%", md: "68%" }}
          >
            <Chatbox
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
            />
          </Box>
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
