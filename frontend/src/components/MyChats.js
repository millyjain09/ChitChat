import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast, Button, HStack, VStack, Avatar, AvatarBadge, Badge, useColorModeValue, Image } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import CallHistory from "./CallHistory";

const MyChats = ({ fetchAgain, mobileTab }) => { 
  const toast = useToast();
  // 🔥 loggedUser state ki zarurat nahi, user context se hi lenge
  const { selectedChat, setSelectedChat, user, chats, setChats, notification, onlineUsers } = ChatState();
  const [desktopView, setDesktopView] = useState("chats"); 

  // Colors & Glass Effect
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.6)", "rgba(0, 0, 0, 0.6)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)");
  const textColor = useColorModeValue("gray.800", "white");
  const subText = useColorModeValue("gray.600", "gray.400");
  const selectedBg = "linear-gradient(to right, #f093fb, #f5576c)"; 
  const hoverBg = useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.1)");

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

  // ✅ fetchAgain ya user change hone par chats refresh hongi
  useEffect(() => {
    fetchChats();
  }, [fetchAgain, fetchChats]);

  const getUnreadCount = (id) => notification.filter((n) => n.chat._id === id).length;
  
  const isUserOnline = (users) => {
    if (!users || !user) return false;
    const other = users.find((u) => u._id !== user._id);
    return onlineUsers.includes(other?._id);
  };

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  const currentView = window.innerWidth < 768 && mobileTab ? mobileTab : desktopView;

  // --- PROFILE VIEW COMPONENT ---
  const ProfileView = () => (
    <VStack spacing={5} mt={10} alignItems="center" color={textColor}>
        <Box position="relative">
            {/* ✅ User Pic hamesha fresh rahegi */}
            <Image 
                borderRadius="full" 
                boxSize="120px" 
                src={user.pic} 
                alt={user.name} 
                border="4px solid white" 
                boxShadow="lg" 
                objectFit="cover"
                fallbackSrc="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
            />
            <Badge position="absolute" bottom="5px" right="5px" colorScheme="green" borderRadius="full" px={2}>Online</Badge>
        </Box>
        <VStack spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" textTransform="capitalize">{user.name}</Text>
            <Text fontSize="md" color={subText}>{user.email}</Text>
        </VStack>
        <Box p={5} w="90%" bg="whiteAlpha.300" borderRadius="xl" textAlign="center">
            <Text fontStyle="italic">"{user.bio || "Hey there! I am using Chit-Chat."}"</Text>
        </Box>
    </VStack>
  );

  return (
    <Box
      display="flex"
      flexDir="column"
      bg={glassBg}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor={borderColor}
      w="100%"
      h="100%"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
    >
      {/* HEADER */}
      {currentView !== "profile" && (
          <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
            <HStack justify="space-between" mb={3}>
              <Text fontSize={{ base: "20px", md: "24px" }} fontFamily="Work sans" fontWeight="bold" color={textColor}>
                {currentView === "chats" ? "Chats" : "Call History"}
              </Text>

              {currentView === "chats" && (
                <GroupChatModal>
                  <Button size="sm" fontSize={{ base: "12px", md: "14px" }} rightIcon={<AddIcon />} colorScheme="pink" variant="solid" borderRadius="full">
                    New Group
                  </Button>
                </GroupChatModal>
              )}
            </HStack>

            <Box display={{ base: "none", md: "block" }}>
                <HStack bg="blackAlpha.100" p="4px" borderRadius="lg">
                <Button flex={1} size="sm" borderRadius="md" bg={desktopView === "chats" ? "white" : "transparent"} color={desktopView === "chats" ? "black" : subText} boxShadow={desktopView === "chats" ? "sm" : "none"} onClick={() => setDesktopView("chats")}>
                    Chats
                </Button>
                <Button flex={1} size="sm" borderRadius="md" bg={desktopView === "calls" ? "white" : "transparent"} color={desktopView === "calls" ? "black" : subText} boxShadow={desktopView === "calls" ? "sm" : "none"} onClick={() => setDesktopView("calls")}>
                    Calls
                </Button>
                </HStack>
            </Box>
          </Box>
      )}

      {/* BODY CONTENT */}
      <Box flex={1} p={2} overflowY="auto">
        
        {currentView === "calls" && <CallHistory />}
        {currentView === "profile" && <ProfileView />}

        {currentView === "chats" &&
          (chats ? (
            <Stack spacing={2}>
              {chats.map((chat) => {
                // ✅ Check user exists
                if(!user) return null;

                const unread = getUnreadCount(chat._id);
                const online = !chat.isGroupChat && isUserOnline(chat.users);
                const isSelected = selectedChat?._id === chat._id;

                let chatName = "Chat";
                let chatPic = "";

                if(chat.isGroupChat) {
                    chatName = chat.chatName;
                    // Group pic logic agar hai to yahan daal sakte ho
                } else {
                    // ✅ user context se aa raha hai, to logic solid rahega
                    const otherUser = getSenderFull(user, chat.users);
                    chatName = otherUser?.name || "User";
                    chatPic = otherUser?.pic || "";
                }

                return (
                  <Box
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    bg={isSelected ? selectedBg : "transparent"}
                    color={isSelected ? "white" : textColor}
                    p={3}
                    borderRadius="xl"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ bg: isSelected ? selectedBg : hoverBg, transform: "scale(1.02)" }}
                    boxShadow={isSelected ? "md" : "none"}
                  >
                    <HStack>
                      {/* ✅ Key prop se React force re-render karega jab pic change hogi */}
                      <Avatar 
                        key={chatPic} 
                        size="sm" 
                        name={chatName} 
                        src={chatPic} 
                        border="2px solid white"
                        bg="purple.500" // Fallback color agar pic na ho
                      >
                        {online && <AvatarBadge boxSize="1em" bg="green.400" border="2px solid white" />}
                      </Avatar>

                      <VStack align="start" spacing={0} flex={1} overflow="hidden">
                        <HStack w="100%" justify="space-between">
                          <Text fontWeight="bold" fontSize="15px" isTruncated textTransform="capitalize">
                            {chatName}
                          </Text>
                          <Text fontSize="10px" opacity={0.7} minW="50px" textAlign="right">
                            {formatTime(chat.latestMessage?.createdAt)}
                          </Text>
                        </HStack>

                        <HStack w="100%" justify="space-between">
                          <Text fontSize="13px" opacity={0.8} isTruncated maxW="80%">
                            {chat.latestMessage ? (
                                <span>
                                    {chat.latestMessage.sender._id === user._id && "You: "} 
                                    {chat.latestMessage.content.length > 30 ? chat.latestMessage.content.substring(0, 31) + "..." : chat.latestMessage.content}
                                </span>
                            ) : "Start a conversation"}
                          </Text>
                          {unread > 0 && (
                            <Badge bg="red.500" color="white" borderRadius="full" fontSize="0.7em" px={2} boxShadow="sm">
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