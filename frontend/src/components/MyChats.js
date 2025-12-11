// 🔥 FULLY RESPONSIVE FIXED MyChats.js

import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast, Button, HStack, VStack, Avatar, AvatarBadge, Badge, useColorModeValue } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import CallHistory from "./CallHistory";

const MyChats = ({ fetchAgain }) => {
  const toast = useToast();
  const { selectedChat, setSelectedChat, user, chats, setChats, notification, onlineUsers } = ChatState();
  const [loggedUser, setLoggedUser] = useState(null);
  const [view, setView] = useState("chats");

  // Colors for Theme
  const bg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("black", "white");
  const listBg = useColorModeValue("#F8F9FA", "gray.900");

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

  const getUnreadCount = (chatId) =>
    notification.filter((n) => n.chat._id === chatId).length;

  const isUserOnline = (chatUsers) => {
    if (!chatUsers || !loggedUser) return false;
    const otherUser = chatUsers.find((u) => u._id !== loggedUser._id);
    return otherUser && onlineUsers.includes(otherUser._id);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={{ base: 2, md: 3 }}          // ⭐ mobile padding fix
      bg={bg}
      w={{ base: "100%", md: "32%" }} // ⭐ width fix for mobile
      borderRadius="xl"
      borderWidth="1px"
      boxShadow="sm"
      overflow="hidden"
    >
      {/* HEADER */}
      <Box pb={2} px={2} w="100%" display="flex" flexDir="column" gap={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="22px" fontFamily="Work sans" fontWeight="bold" color={textColor}>
            {view === "chats" ? "Chats" : "Calls"}
          </Text>

          {view === "chats" && (
            <GroupChatModal>
              <Button
                size="sm"
                rightIcon={<AddIcon />}
                bgGradient="linear(to-r, blue.400, blue.600)"
                color="white"
                borderRadius="full"
                px={4}
                _hover={{ bgGradient: "linear(to-r, blue.500, blue.700)" }}
              >
                New Group
              </Button>
            </GroupChatModal>
          )}
        </Box>

        {/* TABS */}
        <HStack w="100%" bg={useColorModeValue("gray.100", "gray.700")} p="4px" borderRadius="full">
          <Button
            flex={1}
            borderRadius="full"
            size="sm"
            bg={view === "chats" ? "white" : "transparent"}
            color={view === "chats" ? "black" : "gray.500"}
            onClick={() => setView("chats")}
          >
            Chats
          </Button>

          <Button
            flex={1}
            borderRadius="full"
            size="sm"
            bg={view === "calls" ? "white" : "transparent"}
            color={view === "calls" ? "black" : "gray.500"}
            onClick={() => setView("calls")}
          >
            Calls
          </Button>
        </HStack>
      </Box>

      {/* CONTENT */}
      <Box
        display="flex"
        flexDir="column"
        p={{ base: 1, md: 2 }}         // ⭐ mobile padding fix
        bg={listBg}
        w="100%"
        h="100%"
        borderRadius="xl"
        overflowY="auto"
      >
        {view === "calls" && <CallHistory />}

        {view === "chats" && (
          chats ? (
            <Stack spacing={2}>
              {chats.map((chat) => {
                const unreadCount = getUnreadCount(chat._id);
                const isOnline = !chat.isGroupChat && isUserOnline(chat.users);

                return (
                  <Box
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    cursor="pointer"
                    bg={selectedChat?._id === chat._id ? "white" : "transparent"}
                    borderRadius="lg"
                    px={3}
                    py={2}
                    borderWidth={selectedChat?._id === chat._id ? "1.5px" : "1px"}
                    borderColor={selectedChat?._id === chat._id ? "blue.400" : "gray.200"}
                    _hover={{ bg: hoverBg }}
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="md"
                        src={
                          !chat.isGroupChat
                            ? chat.users.find((u) => u._id !== loggedUser?._id)?.pic
                            : "https://cdn-icons-png.flaticon.com/512/166/166258.png"
                        }
                      >
                        {isOnline && <AvatarBadge boxSize="1em" bg="green.500" />}
                      </Avatar>

                      <VStack align="start" spacing={0} flex={1}>
                        <HStack justifyContent="space-between" w="100%">
                          <Text fontWeight="bold" maxW="70%" isTruncated fontSize="15px">
                            {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                          </Text>

                          {chat.latestMessage && (
                            <Text fontSize="10px" color="gray.500">
                              {formatTime(chat.latestMessage.createdAt)}
                            </Text>
                          )}
                        </HStack>

                        <HStack justifyContent="space-between" w="100%">
                          <Text fontSize="13px" color="gray.600" maxW="75%" isTruncated>
                            {chat.latestMessage
                              ? `${chat.latestMessage.sender._id === loggedUser?._id ? "You: " : ""}${chat.latestMessage.content}`
                              : "Start a conversation"}
                          </Text>

                          {unreadCount > 0 && (
                            <Badge borderRadius="full" bg="green.500" color="white" fontSize="10px">
                              {unreadCount}
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <ChatLoading />
          )
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
