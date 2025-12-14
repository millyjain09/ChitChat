import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast, Button, HStack, VStack, Avatar, AvatarBadge, Badge, Tab, TabList, Tabs, useColorModeValue } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import CallHistory from "./CallHistory"; // ✅ Import New Component

const MyChats = ({ fetchAgain }) => {
  const toast = useToast();
  const { selectedChat, setSelectedChat, user, chats, setChats, notification, onlineUsers } = ChatState();
  const [loggedUser, setLoggedUser] = useState(null);
  const [view, setView] = useState("chats"); // ✅ 'chats' or 'calls'

  // Colors for Theme
  const bg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const fetchChats = useCallback(async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/chat", config);
      setChats(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error Occurred!", status: "error", duration: 5000, isClosable: true });
    }
  }, [user, setChats, toast]);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain, fetchChats]);

  const getUnreadCount = (chatId) => notification.filter((n) => n.chat._id === chatId).length;
  const isUserOnline = (chatUsers) => {
    if (!chatUsers || !loggedUser) return false;
    const otherUser = chatUsers.find(u => u._id !== loggedUser._id);
    return otherUser && onlineUsers.includes(otherUser._id);
  };

  // Helper: Format Time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg={bg}
      w={{ base: "100%", md: "31%" }}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="base"
    >
      {/* --- HEADER SECTION WITH TABS --- */}
      <Box pb={3} px={2} w="100%" display="flex" flexDir="column" gap={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="24px" fontFamily="Work sans" fontWeight="800" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">
            {view === "chats" ? "Chats" : "Calls"}
          </Text>
          
          {view === "chats" && (
              <GroupChatModal>
                <Button d="flex" fontSize={{ base: "17px", md: "10px", lg: "17px" }} rightIcon={<AddIcon />} size="sm" bgGradient="linear(to-r, blue.400, blue.600)" color="white" _hover={{ bgGradient: "linear(to-r, blue.500, blue.700)" }} borderRadius="full" px={5}>
                  New Group
                </Button>
              </GroupChatModal>
          )}
        </Box>

        {/* ✅ TABS SWITCHER (WhatsApp Style) */}
        <HStack w="100%" bg={useColorModeValue("gray.100", "gray.700")} p={1} borderRadius="full">
            <Button 
                flex={1} 
                size="sm" 
                borderRadius="full" 
                bg={view === "chats" ? "white" : "transparent"} 
                color={view === "chats" ? "black" : "gray.500"}
                shadow={view === "chats" ? "sm" : "none"}
                onClick={() => setView("chats")}
            >
                Chats
            </Button>
            <Button 
                flex={1} 
                size="sm" 
                borderRadius="full" 
                bg={view === "calls" ? "white" : "transparent"} 
                color={view === "calls" ? "black" : "gray.500"}
                shadow={view === "calls" ? "sm" : "none"}
                onClick={() => setView("calls")}
            >
                Calls
            </Button>
        </HStack>
      </Box>

      {/* --- CONTENT SECTION --- */}
      <Box display="flex" flexDir="column" p={2} bg={useColorModeValue("#F8F9FA", "gray.900")} w="100%" h="100%" borderRadius="xl" overflowY="hidden">
        
        {/* ✅ VIEW 1: CALL HISTORY */}
        {view === "calls" && <CallHistory />}

        {/* ✅ VIEW 2: CHAT LIST (Old Code) */}
        {view === "chats" && (
            chats ? (
            <Stack overflowY="scroll" className="hide-scrollbar" spacing={2}>
                {chats.map((chat) => {
                const unreadCount = getUnreadCount(chat._id);
                const isOnline = !chat.isGroupChat && isUserOnline(chat.users);
                
                return (
                    <Box
                    onClick={() => setSelectedChat(chat)}
                    cursor="pointer"
                    bg={selectedChat?._id === chat._id ? "white" : bg} // Active logic fix
                    color={textColor}
                    border={selectedChat?._id === chat._id ? "2px solid" : "1px solid"}
                    borderColor={selectedChat?._id === chat._id ? "blue.400" : "transparent"}
                    px={3} py={3} borderRadius="xl" key={chat._id}
                    boxShadow={selectedChat?._id === chat._id ? "md" : "none"}
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                    >
                    <HStack alignItems="flex-start" spacing={3}>
                        <Box position="relative">
                            <Avatar size="md" name={!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName} src={!chat.isGroupChat ? chat.users.find(u => u._id !== loggedUser?._id)?.pic : "https://cdn-icons-png.flaticon.com/512/166/166258.png"} border="2px solid white">
                                {isOnline && <AvatarBadge boxSize="1em" bg="green.500" borderColor="white" borderWidth="2px" />}
                            </Avatar>
                        </Box>
                        <VStack align="start" spacing={0} w="100%" overflow="hidden">
                            <HStack w="100%" justifyContent="space-between">
                            <Text fontWeight="bold" fontSize="16px" isTruncated maxW="70%">
                                {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                            </Text>
                            {chat.latestMessage && (
                                <Text fontSize="10px" color={unreadCount > 0 ? "green.500" : "gray.500"} fontWeight={unreadCount > 0 ? "bold" : "normal"}>
                                {formatTime(chat.latestMessage.createdAt)}
                                </Text>
                            )}
                            </HStack>
                            <HStack w="100%" justifyContent="space-between">
                            <Text fontSize="13px" color="gray.500" isTruncated maxW="80%">
                                {chat.latestMessage ? (
                                <>
                                    <span style={{ fontWeight: "500", color: textColor }}>
                                    {chat.latestMessage.sender._id === loggedUser?._id ? "You: " : ""}
                                    </span>
                                    {chat.latestMessage.content.length > 30 ? chat.latestMessage.content.substring(0, 31) + "..." : chat.latestMessage.content}
                                </>
                                ) : "Start a conversation"}
                            </Text>
                            {unreadCount > 0 && <Badge borderRadius="full" bg="green.500" color="white" fontSize="10px" px={2}>{unreadCount}</Badge>}
                            </HStack>
                        </VStack>
                    </HStack>
                    </Box>
                );
                })}
            </Stack>
            ) : <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;