import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import { useColorModeValue } from "@chakra-ui/react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import { FaComment, FaPhone, FaUser } from "react-icons/fa"; 

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, selectedChat } = ChatState();
  const [mobileTab, setMobileTab] = useState("chats");

  const navBg = useColorModeValue("white", "gray.900");
  const activeColor = useColorModeValue("#f5576c", "#f093fb");
  const inactiveColor = useColorModeValue("gray.400", "gray.600");

  return (
    // 🔥 Main container ab relative rahega aur overflow hidden
    <Box w="100%" h="100vh" display="flex" flexDir="column" overflow="hidden" position="relative">
      
      {/* 1. HEADER */}
      <Box w="100%" flex="0 0 auto" zIndex="10">
        {user && <SideDrawer />}
      </Box>

      {/* 2. MAIN CONTENT */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        w="100%" 
        flex="1" // Bachi hui height lega
        overflow="hidden"
        p="10px"
        // 🔥 Mobile pe niche jagah banayi Bottom Bar ke liye
        pb={{ base: "65px", md: "10px" }} 
      >
        {/* MyChats (Left) */}
        {user && (
          <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            w={{ base: "100%", md: "31%" }}
            h="100%"
            flexDir="column"
          >
            <MyChats fetchAgain={fetchAgain} mobileTab={mobileTab} /> 
          </Box>
        )}

        {/* Chatbox (Right) */}
        {user && (
          <Box
            display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
            w={{ base: "100%", md: "68%" }}
            h="100%"
          >
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          </Box>
        )}
      </Box>

      {/* 3. BOTTOM NAVIGATION (Mobile Only) */}
      <Box
        display={{ base: selectedChat ? "none" : "flex", md: "none" }} 
        position="absolute" // Fixed position
        bottom="0"
        left="0"
        w="100%"
        h="60px"
        bg={navBg}
        borderTop="1px solid rgba(0,0,0,0.05)"
        boxShadow="0px -5px 15px rgba(0,0,0,0.05)"
        justifyContent="space-around"
        alignItems="center"
        zIndex="20"
      >
         <Box onClick={() => setMobileTab("chats")} textAlign="center" flex={1} color={mobileTab==="chats" ? activeColor : inactiveColor}>
            <FaComment size={20} style={{margin:"auto", marginBottom:"2px"}}/>
            <Box fontSize="10px" fontWeight="bold">Chats</Box>
         </Box>

         <Box onClick={() => setMobileTab("calls")} textAlign="center" flex={1} color={mobileTab==="calls" ? activeColor : inactiveColor}>
            <FaPhone size={20} style={{margin:"auto", marginBottom:"2px"}}/>
            <Box fontSize="10px" fontWeight="bold">Calls</Box>
         </Box>

         <Box onClick={() => setMobileTab("profile")} textAlign="center" flex={1} color={mobileTab==="profile" ? activeColor : inactiveColor}>
            <FaUser size={20} style={{margin:"auto", marginBottom:"2px"}}/>
            <Box fontSize="10px" fontWeight="bold">Profile</Box>
         </Box>
      </Box>

    </Box>
  );
};

export default Chatpage;