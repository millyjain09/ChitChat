import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text, HStack } from "@chakra-ui/layout";
import "./styles.css";
import {
  IconButton,
  Spinner,
  useToast,
  Tooltip,
  Badge,
} from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
import { FaPhoneAlt, FaVideo, FaSmile, FaPaperPlane, FaTimes } from "react-icons/fa"; // ✅ FaTimes added
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import Picker from "emoji-picker-react";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    socket,
    startCall,
    onlineUsers 
  } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // ✅ NEW: Reply State
  const [replyMessage, setReplyMessage] = useState(null);
  
  const fileInputRef = useRef(null);
  const toast = useToast();
  const lastTypingTimeRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  // Helper to Check Online Status
  const checkOnlineStatus = () => {
     if(!selectedChat || selectedChat.isGroupChat) return false;
     const otherUser = selectedChat.users.find(u => u._id !== user._id);
     return otherUser && onlineUsers.includes(otherUser._id);
  };

  // ---------------- Fetch Messages ----------------
  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      if (socket) socket.emit("join chat", selectedChat._id);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // Reset reply message when chat changes
  useEffect(() => {
    fetchMessages();
    setReplyMessage(null); 
    // eslint-disable-next-line
  }, [selectedChat]);

  // ---------------- Send Message ----------------
  // const sendMessage = async (e) => {
  //   if ((e.key === "Enter" || e.type === "click") && (newMessage.trim() || selectedFile)) {
  //     if(e.key === "Enter") e.preventDefault();
  //     if (!selectedChat || !selectedChat._id) return;

  //     try {
  //       let res;
  //       const config = { headers: { Authorization: `Bearer ${user.token}` } };

  //       // ✅ Case 1: File Upload (with potential Reply)
  //       if (selectedFile) {
  //         const formData = new FormData();
  //         formData.append("chatId", selectedChat._id);
  //         if (newMessage.trim()) formData.append("content", newMessage.trim());
  //         formData.append("file", selectedFile);
  //         if (replyMessage) formData.append("replyTo", replyMessage._id); // Send Reply ID

  //         res = await axios.post("/api/message", formData, config);
  //       } 
  //       // ✅ Case 2: Text Message (with potential Reply)
  //       else {
  //         const payload = { 
  //             chatId: selectedChat._id, 
  //             content: newMessage.trim(),
  //             replyTo: replyMessage ? replyMessage._id : null // Send Reply ID
  //         };
  //         res = await axios.post("/api/message", payload, config);
  //       }
  
  //       const data = res.data;
  //       if (!data.chat || !data.chat.users) data.chat = selectedChat;
  
  //       if (socket) socket.emit("new message", data);
  //       setMessages((prev) => [...prev, data]);
  //       setNewMessage("");
  //       setSelectedFile(null);
  //       setShowEmojiPicker(false);
  //       setReplyMessage(null); // ✅ Clear reply after sending
        
  //       if (socket && typing) {
  //           socket.emit("stop typing", selectedChat._id);
  //           setTyping(false);
  //       }

  //     } catch (error) {
  //       toast({
  //         title: "Error Occurred!",
  //         description: "Failed to send the message",
  //         status: "error",
  //         duration: 5000,
  //         isClosable: true,
  //         position: "bottom",
  //       });
  //     }
  //   }
  // };


  // ---------------- Send Message (UPDATED) ----------------
const sendMessage = async (e) => {
    if ((e.key === "Enter" || e.type === "click") && (newMessage.trim() || selectedFile)) {
        if(e.key === "Enter") e.preventDefault();
        if (!selectedChat || !selectedChat._id) return;

        try {
            let res;
            // COMMON CONFIG (For both cases)
            let config = { 
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                } 
            };
            
            // ✅ Case 1: File Upload (with potential Reply) - CRITICAL CHANGE HERE
            if (selectedFile) {
                const formData = new FormData();
                formData.append("chatId", selectedChat._id);
                if (newMessage.trim()) formData.append("content", newMessage.trim());
                // Multer expects the file field name to be 'file' as per your backend (L-133)
                formData.append("file", selectedFile); 
                if (replyMessage) formData.append("replyTo", replyMessage._id); 

                // --- CRITICAL FIX --- 
                // Set Content-Type to undefined so browser/axios can set it correctly for FormData
                config.headers['Content-Type'] = 'multipart/form-data'; // Use this line for better compatibility
                // OR use: config.headers['Content-Type'] = undefined; 
                // I'll stick to 'multipart/form-data' explicitly here for clarity
                // But we must also ensure the 'boundary' is added. Setting it manually to undefined lets axios handle the boundary.

                config = { 
                    headers: { 
                        Authorization: `Bearer ${user.token}`,
                        // 📢 FIX: Set Content-Type to undefined for FormData boundary to be auto-set
                        "Content-Type": undefined 
                    } 
                };

                res = await axios.post("/api/message", formData, config);
            } 
            // ✅ Case 2: Text Message (with potential Reply)
            else {
                // For JSON data, Content-Type defaults to application/json, which is correct
                const payload = { 
                    chatId: selectedChat._id, 
                    content: newMessage.trim(),
                    replyTo: replyMessage ? replyMessage._id : null
                };
                // Use default config for JSON
                config.headers['Content-Type'] = 'application/json'; // Explicitly set for text message
                res = await axios.post("/api/message", payload, config);
            }
    
            const data = res.data;
            if (!data.chat || !data.chat.users) data.chat = selectedChat;
    
            if (socket) socket.emit("new message", data);
            setMessages((prev) => [...prev, data]);
            setNewMessage("");
            setSelectedFile(null);
            setShowEmojiPicker(false);
            setReplyMessage(null);
            
            if (socket && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }

        } catch (error) {
            console.error("Sending message failed:", error.response || error);
            toast({
                title: "Error Occurred!",
                description: "Failed to send the message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }
};

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + (emojiObject?.emoji || ""));
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    lastTypingTimeRef.current = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - (lastTypingTimeRef.current || 0);
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // ---------------- Socket Listeners ----------------
  useEffect(() => {
    if (!socket) return;
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    const messageHandler = (newMessageRecieved) => {
      if (!newMessageRecieved || !newMessageRecieved.chat) return;

      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        if (!notification.find((n) => n._id === newMessageRecieved._id)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
        socket.emit("message delivered", {
          messageId: newMessageRecieved._id,
          chat: newMessageRecieved.chat,
        });
        socket.emit("message seen", {
          messageId: newMessageRecieved._id,
          chat: newMessageRecieved.chat,
        });
      }
    };

    socket.on("message received", messageHandler);
    
    socket.on("message delivered update", (messageId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg
        )
      );
    });

    socket.on("message seen update", (messageId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "seen" } : msg
        )
      );
    });

    return () => {
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message received", messageHandler);
      socket.off("message delivered update");
      socket.off("message seen update");
    };
  }, [socket, selectedChat, notification]);

  // Handle Start Call
  const handleStartCall = (isVideo = false) => {
    if (!selectedChat) return;
    const receiver = selectedChat.users.find((u) => u._id !== user._id);
    if (!receiver) return;
    startCall(receiver._id, isVideo);
  };

  // ---------------- Render ----------------
  return (
    <>
      {selectedChat ? (
        <>
          {/* Header */}
          <Box
            fontSize={{ base: "20px", md: "24px" }}
            py={3}
            px={4}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bg="white"
            borderBottom="1px solid"
            borderColor="gray.200"
            boxShadow="sm"
            zIndex={10}
          >
            <Box display="flex" alignItems="center" gap="12px">
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
                variant="ghost"
                borderRadius="full"
              />
              
              {!selectedChat.isGroupChat ? (
                <>
                 <Box>
                    <Text fontWeight="bold" color="gray.700">
                        {getSender(user, selectedChat.users)}
                    </Text>
                    <Text fontSize="xs" color={checkOnlineStatus() ? "green.500" : "gray.400"} fontWeight="bold">
                        {checkOnlineStatus() ? "● Online" : "Offline"}
                    </Text>
                 </Box>
                  <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                </>
              ) : (
                <>
                  <Text fontWeight="bold" color="gray.700">
                    {selectedChat.chatName.toUpperCase()}
                  </Text>
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              )}
            </Box>

            {/* Call buttons */}
            {!selectedChat.isGroupChat && (
                <HStack spacing={2}>
                  <IconButton
                    icon={<FaPhoneAlt />}
                    colorScheme="green"
                    variant="ghost"
                    isRound
                    size="md"
                    onClick={() => handleStartCall(false)} 
                    _hover={{ bg: "green.100", color: "green.600" }}
                  />
                  <IconButton
                    icon={<FaVideo />}
                    colorScheme="blue"
                    variant="ghost"
                    isRound
                    size="md"
                    onClick={() => handleStartCall(true)} 
                    _hover={{ bg: "blue.100", color: "blue.600" }}
                  />
                </HStack>
            )}
          </Box>

          {/* Chat Body */}
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#f0f2f5" 
            backgroundImage="url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')"
            backgroundBlendMode="multiply"
            w="100%"
            h="100%"
            overflowY="hidden"
            position="relative"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" color="blue.500" />
            ) : (
              <div className="messages" style={{ scrollBehavior: "smooth" }}>
                {/* ✅ Passed setReplyMessage and setMessages */}
                <ScrollableChat
                  messages={messages}
                  setMessages={setMessages} 
                  socket={socket}
                  selectedChat={selectedChat}
                  setReplyMessage={setReplyMessage} 
                />
              </div>
            )}

            {istyping && (
              <Box 
                display="flex" 
                mb={2} 
                bg="white" 
                borderRadius="full" 
                width="fit-content" 
                px={2} 
                py={1}
                boxShadow="sm"
              >
                <Lottie options={defaultOptions} height={30} width={50} />
              </Box>
            )}

            {/* Input Footer */}
            <FormControl isRequired mt={2}>
              
               {/* ✅ REPLY PREVIEW BANNER */}
               {replyMessage && (
                  <Box 
                    bg="gray.100" 
                    p={2} 
                    borderLeft="4px solid purple" 
                    mb={2} 
                    borderRadius="md" 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                  >
                      <Box>
                          <Text fontSize="xs" fontWeight="bold" color="purple.600">
                              Replying to {replyMessage.sender.name}
                          </Text>
                          <Text fontSize="sm" noOfLines={1}>
                              {replyMessage.content || "Attachment"}
                          </Text>
                      </Box>
                      <IconButton 
                        size="xs" 
                        icon={<FaTimes/>} 
                        onClick={() => setReplyMessage(null)} 
                        variant="ghost"
                      />
                  </Box>
              )}

               {selectedFile && (
                <Badge 
                    mb={2} 
                    borderRadius="full" 
                    px={3} 
                    py={1} 
                    colorScheme="purple" 
                    display="flex" 
                    alignItems="center" 
                    width="fit-content"
                    boxShadow="md"
                >
                  <AttachmentIcon mr={2} /> {selectedFile.name}
                  <CloseIcon ml={2} cursor="pointer" onClick={() => setSelectedFile(null)} w={2} h={2} />
                </Badge>
              )}

              {showEmojiPicker && (
                <Box position="absolute" bottom="70px" left="20px" zIndex={100} boxShadow="xl">
                  <Picker onEmojiClick={onEmojiClick} />
                </Box>
              )}

              <HStack 
                bg="white" 
                p={2} 
                borderRadius="full" 
                boxShadow="md" 
                border="1px solid" 
                borderColor="gray.200"
                alignItems="center"
              >
                <Tooltip label="Attach File">
                  <IconButton 
                    icon={<AttachmentIcon />} 
                    onClick={() => fileInputRef.current.click()} 
                    variant="ghost"
                    isRound
                    color="gray.500"
                    _hover={{ bg: "gray.100", color: "blue.500" }}
                  />
                </Tooltip>
                <input
                  type="file"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />

                <Tooltip label="Emoji">
                  <IconButton 
                    icon={<FaSmile />} 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    variant="ghost"
                    isRound
                    color="gray.500"
                    _hover={{ bg: "gray.100", color: "orange.400" }}
                  />
                </Tooltip>

                <Input
                  variant="unstyled"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={sendMessage} 
                  bg="transparent"
                  px={2}
                  fontSize="md"
                  h="100%"
                />

                <Tooltip label="Send">
                  <IconButton
                    bgGradient="linear(to-r, blue.400, blue.600)"
                    color="white"
                    icon={<FaPaperPlane />}
                    onClick={sendMessage} 
                    isRound
                    boxShadow="md"
                    _hover={{
                        bgGradient: "linear(to-r, blue.500, blue.700)",
                        transform: "scale(1.05)"
                    }}
                    size="md"
                  />
                </Tooltip>
              </HStack>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            h="100%" 
            bg="white" 
            flexDir="column"
            textAlign="center"
            bgImage="url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')"
            backgroundBlendMode="overlay"
        >
          <Box 
            bg="rgba(255,255,255,0.9)" 
            p={8} 
            borderRadius="2xl" 
            boxShadow="lg"
          >
            <Text fontSize="4xl" mb={4}>👋</Text>
            <Text fontSize="2xl" fontFamily="Work sans" fontWeight="bold" color="gray.700">
              Welcome to Chit-Chat
            </Text>
            <Text color="gray.500" mt={2}>
                Select a chat from the left menu to start messaging.
            </Text>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SingleChat;