import { CloseIcon } from "@chakra-ui/icons";
import { Badge, Box, Text } from "@chakra-ui/layout";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={3}
      py={2}
      borderRadius="full"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      bgGradient="linear(to-r, purple.400, blue.400)"
      color="white"
      cursor="pointer"
      onClick={handleFunction}
      display="flex"
      alignItems="center"
      boxShadow="sm"
      textTransform="none"
      _hover={{
        transform: "scale(1.05)",
        bgGradient: "linear(to-r, purple.500, blue.500)",
        boxShadow: "md",
      }}
      transition="all 0.2s"
    >
      <Text fontWeight="bold" mr={1}>
        {user.name}
      </Text>
      
      {admin === user._id && (
        <Text as="span" fontSize="xs" fontWeight="normal" mr={1} opacity={0.8}>
           (Admin)
        </Text>
      )}
      
      <CloseIcon pl={1} w={3} h={3} />
    </Badge>
  );
};

export default UserBadgeItem;