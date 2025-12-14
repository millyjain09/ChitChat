import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import {
  useToast,
  Button,
  HStack,
  VStack,
  Avatar,
  AvatarBadge,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import CallHistory from "./CallHistory";

const MyChats = ({ fetchAgain }) => {
  const toast = useToast();
  const { selectedChat, setSelectedChat, user, chats, setChats, notification, onlineUsers } =
    ChatState();

  const [loggedUser, setLoggedUser] = useState(null);
  const [view, setView] = useState("chats");

  const bg = useColorModeValue("white", "gray.800");
  const listBg = useColorModeValue("gray.100", "gray.900");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const fetchChats = useCallback(async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/chat", config);
      setChats(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error loading chats", status: "error", duration: 4000 });
    }
  }, [user, setChats, toast]);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain, fetchChats]);

  const getUnreadCount = (id) =>
    notification.filter((n) => n.chat._id === id).length;

  const isUserOnline = (users) => {
    if (!users || !loggedUser) return false;
    const other = users.find((u) => u._id !== loggedUser._id);
    return onlineUsers.includes(other?._id);
  };

  const formatTime = (d) =>
    d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <Box
      display="flex"
      flexDir="column"
      
      bg={bg}
      h="100%"
      w={{ base: "100%", md: "350px" }}
      
      minW={{ md: "350px" }}
      maxW={{ md: "350px" }}
      borderRadius="xl"
      boxShadow="sm"
      overflow="hidden"
    >
      {/* HEADER */}
      <Box p={4}>
        <HStack justify="space-between" mb={3}>
          <Text fontSize="xl" fontWeight="bold">
            {view === "chats" ? "Chats" : "Calls"}
          </Text>

          {view === "chats" && (
            <GroupChatModal>
              <Button
                size="sm"
                rightIcon={<AddIcon />}
                bg="blue.500"
                color="white"
                borderRadius="full"
                _hover={{ bg: "blue.600" }}
              >
                New Group
              </Button>
            </GroupChatModal>
          )}
        </HStack>

        {/* TABS */}
        <HStack bg="gray.100" p="4px" borderRadius="full">
          <Button
            flex={1}
            size="sm"
            borderRadius="full"
            bg={view === "chats" ? "white" : "transparent"}
            onClick={() => setView("chats")}
          >
            Chats
          </Button>
          <Button
            flex={1}
            size="sm"
            borderRadius="full"
            bg={view === "calls" ? "white" : "transparent"}
            onClick={() => setView("calls")}
          >
            Calls
          </Button>
        </HStack>
      </Box>

      {/* LIST */}
      <Box flex={1} bg={listBg} p={2} overflowY="auto">
        {view === "calls" && <CallHistory />}

        {view === "chats" &&
          (chats ? (
            <Stack spacing={2}>
              {chats.map((chat) => {
                const unread = getUnreadCount(chat._id);
                const online = !chat.isGroupChat && isUserOnline(chat.users);

                return (
                  <Box
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    bg={selectedChat?._id === chat._id ? "white" : "transparent"}
                    p={3}
                    borderRadius="lg"
                    
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                  >
                    <HStack>
                      <Avatar size="md">
                        {online && <AvatarBadge bg="green.500" />}
                      </Avatar>

                      <VStack align="start" spacing={0} flex={1}>
                        <HStack w="100%" justify="space-between">
                          <Text fontWeight="bold" isTruncated>
                            {!chat.isGroupChat
                              ? getSender(loggedUser, chat.users)
                              : chat.chatName}
                          </Text>
                          <Text fontSize="10px" color="gray.500">
                            {formatTime(chat.latestMessage?.createdAt)}
                          </Text>
                        </HStack>

                        <HStack w="100%" justify="space-between">
                          <Text fontSize="sm" color="gray.600" isTruncated>
                            {chat.latestMessage?.content || "Start a conversation"}
                          </Text>
                          {unread > 0 && (
                            <Badge bg="green.500" color="white" borderRadius="full">
                              {unread}
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
          ))}
      </Box>
    </Box>
  );
};

export default MyChats;
