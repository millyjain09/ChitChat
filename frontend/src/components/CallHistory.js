import React, { useEffect, useState, useCallback } from "react";
import { Box, Stack, Text, Avatar, HStack, VStack, Icon, Spinner, useColorModeValue } from "@chakra-ui/react";
import { FaPhone, FaVideo, FaArrowDown, FaArrowUp, FaClock } from "react-icons/fa";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { getSenderFull } from "../config/ChatLogics";

const CallHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = ChatState();

  // Glassy & Theme Colors
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const itemBg = useColorModeValue("white", "rgba(255,255,255,0.05)");
  const hoverBg = useColorModeValue("gray.50", "rgba(255,255,255,0.1)");

  const fetchCallLogs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/message/logs", config);
      setLogs(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const prettyDuration = (durationStr) => {
      if(!durationStr) return null;
      const parts = durationStr.split(":");
      if(parts.length === 2) {
          const mins = parseInt(parts[0]);
          const secs = parseInt(parts[1]);
          if(mins > 0) return `${mins}m ${secs}s`;
          return `${secs}s`;
      }
      return durationStr;
  };

  return (
    <Box w="100%" h="100%" overflowY="hidden" p={2}>
      {loading ? (
        <Spinner size="xl" alignSelf="center" margin="auto" display="block" mt={10} color="pink.500" />
      ) : (
        <Stack overflowY="scroll" className="hide-scrollbar" spacing={3} pb={4}>
          {logs.length === 0 && (
             <VStack mt={20} opacity={0.6}>
                 <FaClock size={40} />
                 <Text>No call history yet</Text>
             </VStack>
          )}
          
          {logs.map((log) => {
            const isOutgoing = log.sender._id === user._id;
            let isMissed = log.callStatus === "Missed" || (log.content && log.content.includes("Missed"));
            let callIcon = (log.callType === "Video" || (log.content && log.content.includes("Video"))) ? FaVideo : FaPhone;
            
            const otherUser = !log.chat.isGroupChat ? getSenderFull(user, log.chat.users) : { name: log.chat.chatName, pic: "https://cdn-icons-png.flaticon.com/512/166/166258.png" };
            const formattedDuration = prettyDuration(log.callDuration);

            return (
              <Box 
                key={log._id} 
                p={4} 
                bg={itemBg} 
                borderRadius="xl" 
                boxShadow="sm"
                cursor="pointer" 
                transition="all 0.2s"
                _hover={{ transform: "translateY(-2px)", bg: hoverBg, boxShadow: "md" }}
                borderLeft={isMissed ? "4px solid #F56565" : (isOutgoing ? "4px solid #48BB78" : "4px solid #4299E1")}
              >
                <HStack justifyContent="space-between">
                  <HStack spacing={4}>
                    <Avatar size="md" name={otherUser.name} src={otherUser.pic} border="2px solid white" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="16px" color={textColor} textTransform="capitalize">
                        {otherUser.name}
                      </Text>
                      <HStack spacing={1} alignItems="center" fontSize="12px" color={subTextColor}>
                        <Icon as={isOutgoing ? FaArrowUp : FaArrowDown} color={isMissed ? "red.400" : (isOutgoing ? "green.400" : "blue.400")} />
                        <Text fontWeight="500">
                           {formatDateTime(log.createdAt)}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  
                  <VStack align="end" spacing={0}>
                      <Icon as={callIcon} color="gray.400" boxSize={4} mb={1} />
                      <Text fontSize="11px" fontWeight="bold" color={isMissed ? "red.400" : "gray.600"}>
                          {isMissed ? "Missed" : formattedDuration || "Ended"}
                      </Text>
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default CallHistory;