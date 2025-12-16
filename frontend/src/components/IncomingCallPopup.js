import { Box, Text, VStack, HStack, Avatar, IconButton, useColorModeValue } from "@chakra-ui/react";
import { PhoneIcon, CloseIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import { keyframes } from "@emotion/react";
import { useEffect, useRef } from "react";
import { FaVideo, FaPhoneAlt } from "react-icons/fa";

// 🔥 Premium Ringtone URL
const ringtoneSound = "https://cdn.pixabay.com/download/audio/2021/08/09/audio_2e245a440e.mp3?filename=smartphone-ringtone-37084.mp3";

const ring = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(107, 70, 193, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(107, 70, 193, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(107, 70, 193, 0); }
`;

const IncomingCallPopup = () => {
  const { incomingCall, setIncomingCall, answerCall } = ChatState();
  const audioRef = useRef(new Audio(ringtoneSound));
  
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");
  const textColor = useColorModeValue("gray.800", "white");

  // 🎵 Ringtone Logic: Mount hote hi bajegi, Unmount pe band
  useEffect(() => {
    if (incomingCall) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    return () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const isVideo = incomingCall.callType === "Video" || (incomingCall.content && incomingCall.content.includes("Video"));

  return (
    <Box
      position="fixed"
      bottom="40px"
      right="40px"
      bg={cardBg}
      backdropFilter="blur(20px)"
      p={6}
      borderRadius="2xl"
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      zIndex={2000}
      width="320px"
      border="1px solid rgba(255, 255, 255, 0.18)"
      animation={`${ring} 2s infinite`} // Pulsing Effect
    >
      <VStack spacing={5}>
        {/* Caller Image */}
        <Box position="relative">
          <Avatar 
            size="xl" 
            name={incomingCall.fromName} 
            src={incomingCall.fromPic} 
            border="4px solid #805AD5"
            boxShadow="lg"
          />
          <Box 
            position="absolute" bottom="0" right="0" 
            bg="white" borderRadius="full" p={1} boxShadow="md"
          >
             {isVideo ? <FaVideo color="#805AD5" size={14}/> : <FaPhoneAlt color="#805AD5" size={14}/>}
          </Box>
        </Box>

        <VStack spacing={0}>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                {incomingCall.fromName}
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Incoming {isVideo ? "Video" : "Voice"} Call...
            </Text>
        </VStack>

        <HStack spacing={10} width="100%" justify="center">
            {/* Decline Button */}
            <VStack spacing={1}>
                <IconButton
                    icon={<CloseIcon />}
                    isRound
                    size="lg"
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600", transform: "scale(1.1)" }}
                    onClick={() => setIncomingCall(null)}
                    boxShadow="lg"
                />
                <Text fontSize="xs" color="gray.500">Decline</Text>
            </VStack>

            {/* Accept Button */}
            <VStack spacing={1}>
                <IconButton
                    icon={<PhoneIcon />}
                    isRound
                    size="lg"
                    bg="green.400"
                    color="white"
                    className="calling-animation"
                    _hover={{ bg: "green.500", transform: "scale(1.1)" }}
                    onClick={answerCall}
                    boxShadow="lg"
                />
                <Text fontSize="xs" color="gray.500">Accept</Text>
            </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default IncomingCallPopup;