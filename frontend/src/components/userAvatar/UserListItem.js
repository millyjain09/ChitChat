import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/react";

const UserListItem = ({ user, handleFunction }) => {
  
  // Theme Aware Colors
  const bg = useColorModeValue("white", "gray.700");
  const hoverBg = "linear-gradient(to right, #f093fb, #f5576c)";
  const textColor = useColorModeValue("black", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg={bg}
      _hover={{
        background: hoverBg,
        color: "white",
        transform: "scale(1.02) translateY(-2px)", // Pop effect
        boxShadow: "lg",
        "& .sub-text": { color: "whiteAlpha.900" } // Hover pe email color change
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color={textColor}
      px={4}
      py={3}
      mb={3}
      borderRadius="xl"
      boxShadow="sm"
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" // Smooth animation
      border="1px solid"
      borderColor="transparent"
    >
      <Avatar
        mr={3}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
        border="2px solid white"
        boxShadow="sm"
      />
      <Box>
        <Text fontWeight="bold" fontSize="md">{user.name}</Text>
        <Text fontSize="xs" fontWeight="500" className="sub-text" color={subTextColor}>
          <b style={{ marginRight: "4px" }}>Email:</b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;