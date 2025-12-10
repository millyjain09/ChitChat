import React, { useEffect, useState, useCallback } from "react";
import { Box, Stack, Text, Avatar, HStack, VStack, Icon, Spinner, useToast, useColorModeValue } from "@chakra-ui/react";
import { FaPhone, FaVideo, FaArrowDown, FaArrowUp, FaClock } from "react-icons/fa";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { getSenderFull } from "../config/ChatLogics";

const CallHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = ChatState();
  const toast = useToast();

  // Theme Colors
  const bg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("black", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");

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

  // Helper: Date Format
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${time}`;
    return `${date.toLocaleDateString()}, ${time}`;
  };

  // ✅ Helper: Pretty Duration (e.g. "0:05" -> "5 sec")
  const prettyDuration = (durationStr) => {
      if(!durationStr) return null;
      const parts = durationStr.split(":");
      if(parts.length === 2) {
          const mins = parseInt(parts[0]);
          const secs = parseInt(parts[1]);
          if(mins > 0) return `${mins} min ${secs} sec`;
          return `${secs} sec`;
      }
      return durationStr;
  };

  return (
    <Box w="100%" h="100%" bg={bg} borderRadius="xl" overflowY="hidden" p={2}>
      {loading ? (
        <Spinner size="xl" alignSelf="center" margin="auto" display="block" mt={10} color="blue.500" />
      ) : (
        <Stack overflowY="scroll" className="hide-scrollbar" spacing={2}>
          {logs.length === 0 && <Text textAlign="center" mt={10} color="gray.500" fontSize="sm">No call history yet</Text>}
          
          {logs.map((log) => {
            const isOutgoing = log.sender._id === user._id;
            
            // Smart Status Check
            let isMissed = log.callStatus === "Missed";
            if (!log.callStatus && log.content) isMissed = log.content.includes("Missed");

            // Smart Icon Check
            let callIcon = FaPhone;
            if (log.callType === "Video" || (log.content && log.content.includes("Video"))) callIcon = FaVideo;
            
            const otherUser = !log.chat.isGroupChat ? getSenderFull(user, log.chat.users) : { name: log.chat.chatName, pic: "https://cdn-icons-png.flaticon.com/512/166/166258.png" };
            const formattedDuration = prettyDuration(log.callDuration);

            return (
              <Box 
                key={log._id} 
                p={3} 
                bg={hoverBg} // Thoda distinct background
                borderRadius="xl" 
                cursor="pointer" 
                transition="all 0.2s"
                _hover={{ transform: "translateY(-1px)", shadow: "sm" }}
              >
                <HStack justifyContent="space-between">
                  <HStack spacing={3}>
                    <Avatar size="md" name={otherUser.name} src={otherUser.pic} border="2px solid white" shadow="sm" />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="16px" color={textColor} textTransform="capitalize">
                        {otherUser.name}
                      </Text>
                      <HStack spacing={1} alignItems="center">
                        <Icon 
                            as={isOutgoing ? FaArrowUp : FaArrowDown} 
                            color={isMissed ? "red.500" : (isOutgoing ? "green.500" : "blue.500")} 
                            boxSize={3} 
                        />
                        <Text fontSize="12px" color={subTextColor} fontWeight="500">
                           {formatDateTime(log.createdAt)}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  
                  {/* ✅ DURATION OR STATUS DISPLAY */}
                  <VStack align="end" spacing={0}>
                      <Icon as={callIcon} color={isMissed ? "red.400" : "green.500"} boxSize={5} mb={1} />
                      
                      {/* Agar Duration hai to Duration dikhao, nahi to Status */}
                      {formattedDuration ? (
                          <HStack spacing={1} opacity={0.8}>
                              <Text fontSize="11px" fontWeight="bold" color={textColor}>{formattedDuration}</Text>
                          </HStack>
                      ) : (
                          <Text fontSize="11px" color="gray.500" fontWeight="bold">
                              {isMissed ? "Missed" : "Ended"}
                          </Text>
                      )}
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