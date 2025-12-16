import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text, HStack, VStack } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast, Tooltip, Badge, useColorModeValue, Image } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
import { FaPhoneAlt, FaVideo, FaSmile, FaPaperPlane, FaTimes, FaComments } from "react-icons/fa";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import Picker from "emoji-picker-react";

// Sounds
const notificationSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"); 
const sendSound = new Audio("https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3"); 

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, user, notification, setNotification, socket, startCall, onlineUsers } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [latestChatDetails, setLatestChatDetails] = useState(null);
  const [sendLoading, setSendLoading] = useState(false);

  const fileInputRef = useRef(null);
  const toast = useToast();
  const lastTypingTimeRef = useRef(null);

  // Theme Colors
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const inputBg = useColorModeValue("white", "gray.700");
  const headerBorder = useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.05)");
  const typingBubbleBg = useColorModeValue("white", "gray.700");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(0, 0, 0, 0.5)");

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const checkOnlineStatus = () => {
     if(!selectedChat || selectedChat.isGroupChat) return false;
     const otherUser = selectedChat.users.find(u => u._id !== user._id);
     return otherUser && onlineUsers.includes(otherUser._id);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      if (socket) socket.emit("join chat", selectedChat._id);
      setLatestChatDetails(selectedChat);
    } catch (error) {
      setLoading(false);
      toast({ title: "Error Occurred!", description: "Failed to Load the Messages", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    }
  };

  useEffect(() => {
    fetchMessages();
    setReplyMessage(null); 
    setLatestChatDetails(selectedChat);
  }, [selectedChat]);

  const sendMessage = async (e) => {
    if ((e.key === "Enter" || e.type === "click") && (newMessage.trim() || selectedFile)) {
        if(e.key === "Enter") e.preventDefault();
        if (!selectedChat || !selectedChat._id) return;

        try {
            setSendLoading(true);
            sendSound.play().catch(e => console.log(e)); 
            
            let res;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            if (selectedFile) {
                // 🔥 FormData Logic for File Upload
                const formData = new FormData();
                formData.append("chatId", selectedChat._id);
                
                if (newMessage.trim()) formData.append("content", newMessage.trim());
                formData.append("file", selectedFile); 
                
                if (replyMessage) formData.append("replyTo", replyMessage._id); 

                // Axios automatically sets Content-Type to multipart/form-data
                res = await axios.post("/api/message", formData, config);
            } else {
                // Normal Text Message
                const payload = { chatId: selectedChat._id, content: newMessage.trim(), replyTo: replyMessage ? replyMessage._id : null };
                config.headers['Content-Type'] = 'application/json'; 
                res = await axios.post("/api/message", payload, config);
            }
    
            const data = res.data;
            if (!data.chat || !data.chat.users) data.chat = selectedChat;
            
            // ✅ Optimistic UI Update (Turant dikhana)
            setMessages([...messages, data]); 
            
            if (socket) socket.emit("new message", data);
            
            setNewMessage("");
            setSelectedFile(null);
            setShowEmojiPicker(false);
            setReplyMessage(null);
            setSendLoading(false);
            
            if (socket) { socket.emit("stop typing", selectedChat._id); setTyping(false); }

        } catch (error) {
            setSendLoading(false);
            console.error("Send Error:", error);
            toast({ title: "Failed to send message", description: "File upload failed or too large.", status: "error", duration: 5000, isClosable: true, position: "bottom" });
        }
    }
  };

  const sendHello = () => { setNewMessage("👋 Hello!"); };

  const handleFileSelect = (e) => { 
      if (e.target.files && e.target.files.length > 0) {
          setSelectedFile(e.target.files[0]);
      }
  };
  
  const onEmojiClick = (emojiObject) => { setNewMessage((prev) => prev + (emojiObject?.emoji || "")); };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedChat) return;
    if (!typing) { setTyping(true); socket.emit("typing", selectedChat._id); }
    lastTypingTimeRef.current = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - (lastTypingTimeRef.current || 0);
      if (timeDiff >= timerLength && typing) { socket.emit("stop typing", selectedChat._id); setTyping(false); }
    }, timerLength);
  };

  useEffect(() => {
    if (!socket) return;
    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);
    
    const handleMessageReceived = (newMessageRecieved) => {
      if (!newMessageRecieved || !newMessageRecieved.chat) return;
      
      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        if (!notification.find((n) => n._id === newMessageRecieved._id)) {
            notificationSound.play().catch(e => console.log(e));
            setNotification([newMessageRecieved, ...notification]);
            setFetchAgain(!fetchAgain);
        }
      } else {
        // 🔥 Double Message Fix: Khud ka message socket se mat lo
        if (newMessageRecieved.sender._id === user._id) return; 
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
      socket.off("message received", handleMessageReceived);
    };
  }, [socket, selectedChat, notification, fetchAgain, user]);

  const handleStartCall = (isVideo = false) => {
    if (!selectedChat) return;
    const receiver = selectedChat.users.find((u) => u._id !== user._id);
    if (!receiver) return;
    startCall(receiver._id, isVideo);
  };

  const currentChatData = latestChatDetails || selectedChat;

  return (
    <>
      {selectedChat ? (
        <>
          {/* HEADER */}
          <Box fontSize={{ base: "18px", md: "24px" }} pb={3} px={2} w="100%" fontFamily="Work sans" display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid" borderColor={headerBorder}>
            <IconButton display={{ base: "flex", md: "none" }} icon={<ArrowBackIcon />} onClick={() => setSelectedChat("")} mr={2} bg="transparent" />
            <Box display="flex" alignItems="center" flex={1} overflow="hidden">
              {!selectedChat.isGroupChat ? (
                <>
                  <Box flex={1}>
                    <Text fontWeight="bold" color={textColor} isTruncated>
                        {currentChatData.users ? getSender(user, currentChatData.users) : "User"}
                    </Text>
                    <Text fontSize="12px" color={checkOnlineStatus() ? "green.400" : "gray.500"} fontWeight="bold">
                        {checkOnlineStatus() ? "● Online" : "Offline"}
                    </Text>
                  </Box>
                  <ProfileModal user={currentChatData.users ? getSenderFull(user, currentChatData.users) : {}} />
                </>
              ) : (
                <>
                  <Text fontWeight="bold" color={textColor} flex={1} isTruncated>{selectedChat.chatName.toUpperCase()}</Text>
                  <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                </>
              )}
            </Box>
            {!selectedChat.isGroupChat && (
                <HStack spacing={1} ml={2}>
                  <IconButton icon={<FaPhoneAlt />} colorScheme="green" variant="ghost" size="sm" borderRadius="full" onClick={() => handleStartCall(false)} />
                  <IconButton icon={<FaVideo />} colorScheme="blue" variant="ghost" size="sm" borderRadius="full" onClick={() => handleStartCall(true)} />
                </HStack>
            )}
          </Box>

          {/* CHAT BODY */}
          <Box display="flex" flexDir="column" justifyContent="flex-end" p={3} w="100%" h="100%" borderRadius="lg" overflowY="hidden">
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" color="pink.500" />
            ) : (
              <div className="messages" style={{ scrollBehavior: "smooth", display: 'flex', flexDirection: 'column', height: '100%' }}>
                {messages && messages.length > 0 ? (
                    <ScrollableChat messages={messages} setMessages={setMessages} socket={socket} selectedChat={selectedChat} setReplyMessage={setReplyMessage} />
                ) : (
                    <VStack flex={1} justifyContent="center" alignItems="center" spacing={4} opacity={0.8}>
                        <Image src="https://cdn-icons-png.flaticon.com/512/9374/9374940.png" h="120px" w="120px" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" className="msg-animate" />
                        <Box textAlign="center">
                            <Text fontSize="xl" fontWeight="bold" color={textColor}>No messages here yet...</Text>
                            <Text fontSize="sm" color="gray.500">Send a message or wave hello! 👋</Text>
                        </Box>
                        <Badge cursor="pointer" colorScheme="purple" p={2} borderRadius="full" onClick={sendHello} _hover={{ transform: "scale(1.05)" }}>Click to say Hi!</Badge>
                    </VStack>
                )}
              </div>
            )}
            
            {istyping && (
              <Box alignSelf="flex-start" ml={2} mb={2} bg={typingBubbleBg} px={3} py={2} borderRadius="xl" borderBottomLeftRadius="none" boxShadow="sm" display="flex" alignItems="center" gap={2}>
                <Lottie options={defaultOptions} height={20} width={40} />
                <Text fontSize="xs" color="gray.500" fontStyle="italic" fontWeight="bold">Typing...</Text>
              </Box>
            )}
            
            <FormControl isRequired mt={3}>
               {replyMessage && (
                  <Box bg={inputBg} p={2} mb={2} borderRadius="lg" display="flex" justifyContent="space-between" boxShadow="md">
                      <Text fontSize="sm" noOfLines={1} color="gray.500">Replying to: {replyMessage.content || "Media"}</Text>
                      <IconButton size="xs" icon={<FaTimes/>} onClick={() => setReplyMessage(null)} />
                  </Box>
              )}
               {selectedFile && (
                <Badge mb={2} colorScheme="purple" p={2} borderRadius="md" display="flex" alignItems="center" gap={2}>
                  <AttachmentIcon /> <Text isTruncated maxW="200px">{selectedFile.name}</Text> <CloseIcon cursor="pointer" onClick={() => setSelectedFile(null)}/>
                </Badge>
              )}
              {showEmojiPicker && <Box position="absolute" bottom="70px" left="20px" zIndex={10}><Picker onEmojiClick={onEmojiClick} /></Box>}

              <HStack bg={inputBg} p={1} borderRadius="full" boxShadow="lg">
                <IconButton icon={<FaSmile />} onClick={() => setShowEmojiPicker(!showEmojiPicker)} variant="ghost" color="gray.500" borderRadius="full"/>
                <IconButton icon={<AttachmentIcon />} onClick={() => fileInputRef.current.click()} variant="ghost" color="gray.500" borderRadius="full"/>
                <input type="file" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileSelect}/>
                
                <Input variant="unstyled" placeholder="Type a message..." value={newMessage} onChange={typingHandler} onKeyDown={sendMessage} px={2} color={textColor}/>
                <IconButton colorScheme="pink" icon={sendLoading ? <Spinner size="xs"/> : <FaPaperPlane />} onClick={sendMessage} borderRadius="full" boxShadow="md" bgGradient="linear(to-r, #f093fb, #f5576c)" _hover={{ transform: "scale(1.05)" }} isLoading={sendLoading}/>
              </HStack>
            </FormControl>
          </Box>
        </>
      ) : (
        // 🔥 Clean Welcome Screen
        <Box display="flex" alignItems="center" justifyContent="center" h="100%" flexDirection="column" p={5}>
          <Box bg={glassBg} backdropFilter="blur(20px)" p={12} borderRadius="3xl" boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.15)" textAlign="center" border="1px solid rgba(255,255,255,0.2)" maxW="500px" className="msg-animate">
            <Box bgGradient="linear(to-br, #f093fb, #f5576c)" p={6} borderRadius="full" boxShadow="xl" display="inline-block" mb={6} css={{ animation: "float 6s ease-in-out infinite" }}>
                <FaComments size="80px" color="white" />
            </Box>
            <Text fontSize="5xl" fontWeight="900" bgGradient="linear(to-r, #f093fb, #f5576c)" bgClip="text" mb={2}>Hi, {user.name}! 👋</Text>
            <Text fontSize="2xl" color={textColor} fontWeight="bold" opacity={0.9} mb={4}>Welcome to Chit-Chat</Text>
            <Text fontSize="lg" color={subTextColor} fontWeight="medium">Select a chat to start messaging.</Text>
          </Box>
          <style>{`@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }`}</style>
        </Box>
      )}
    </>
  );
};

export default SingleChat;