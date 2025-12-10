import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
// import { ChatState } from "../../Context/ChatProvider"; // Iski zaroorat nahi hai yahan

const UserListItem = ({ user, handleFunction }) => {
  
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="white"
      _hover={{
        background: "#38B2AC",
        bgGradient: "linear(to-r, blue.400, blue.600)",
        color: "white",
        transform: "scale(1.02)",
        boxShadow: "md",
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px={3}
      py={3}
      mb={2}
      borderRadius="xl"
      boxShadow="sm"
      transition="all 0.2s"
      border="1px solid"
      borderColor="gray.100"
    >
      <Avatar
        mr={3}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
        border="1px solid"
        borderColor="gray.200"
      />
      <Box>
        <Text fontWeight="bold" fontSize="md">{user.name}</Text>
        <Text fontSize="xs" fontWeight="500" opacity={0.8}>
          <b style={{ marginRight: "4px" }}>Email:</b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;