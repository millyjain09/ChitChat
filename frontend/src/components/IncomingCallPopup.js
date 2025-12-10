import { Box, Button, Text, VStack, HStack, Avatar, IconButton } from "@chakra-ui/react";
import { PhoneIcon, CloseIcon } from "@chakra-ui/icons"; // Icons import kiye
import { ChatState } from "../Context/ChatProvider";
import { keyframes } from "@emotion/react";

const ring = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

const IncomingCallPopup = () => {
  const { incomingCall, setIncomingCall, answerCall } = ChatState();

  if (!incomingCall) return null;

  return (
    <Box
      position="fixed"
      bottom="30px"
      right="30px"
      bgGradient="linear(to-r, blue.600, purple.600)"
      p={6}
      borderRadius="2xl"
      boxShadow="dark-lg"
      zIndex={2000} // Z-index badha diya taaki sabse upar dikhe
      width="300px"
      color="white"
      border="1px solid"
      borderColor="whiteAlpha.300"
      backdropFilter="blur(10px)"
    >
      <VStack spacing={4}>
        {/* Avatar with Ringing Animation */}
        <Box
          as="div"
          animation={`${ring} 2s infinite`}
          borderRadius="full"
        >
          <Avatar 
            size="lg" 
            name={incomingCall.fromName} 
            src={incomingCall.fromPic} // Agar pic available ho to use karega
            border="2px solid white"
          />
        </Box>

        <VStack spacing={0}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
            {incomingCall.fromName || "Unknown User"}
            </Text>
            <Text fontSize="sm" opacity={0.8}>
            Incoming Video Call...
            </Text>
        </VStack>

        <HStack spacing={8} mt={2}>
            {/* Decline Button */}
            <VStack spacing={1}>
                <IconButton
                    icon={<CloseIcon />}
                    colorScheme="red"
                    isRound
                    size="lg"
                    boxShadow="lg"
                    onClick={() => setIncomingCall(null)}
                    _hover={{ transform: "scale(1.1)" }}
                    transition="all 0.2s"
                />
                <Text fontSize="xs" fontWeight="500">Decline</Text>
            </VStack>

            {/* Accept Button */}
            <VStack spacing={1}>
                <IconButton
                    icon={<PhoneIcon />}
                    colorScheme="green"
                    isRound
                    size="lg"
                    boxShadow="lg"
                    onClick={answerCall}
                    _hover={{ transform: "scale(1.1)" }}
                    transition="all 0.2s"
                />
                <Text fontSize="xs" fontWeight="500">Accept</Text>
            </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default IncomingCallPopup;