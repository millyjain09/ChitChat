import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, useDisclosure, FormControl, Input, useToast, Box, useColorModeValue
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  // Glass Theme
  const modalBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(23, 25, 35, 0.9)");
  const inputBg = useColorModeValue("white", "gray.800");

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({ title: "User already added", status: "warning", duration: 5000, isClosable: true, position: "top" });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({ title: "Error Occured!", description: "Failed to Load the Search Results", status: "error", duration: 5000, isClosable: true, position: "bottom-left" });
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({ title: "Please fill all the feilds", status: "warning", duration: 5000, isClosable: true, position: "top" });
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/chat/group`, { name: groupChatName, users: JSON.stringify(selectedUsers.map((u) => u._id)) }, config);
      setChats([data, ...chats]);
      onClose();
      toast({ title: "New Group Chat Created!", status: "success", duration: 5000, isClosable: true, position: "bottom" });
    } catch (error) {
      toast({ title: "Failed to Create the Chat!", description: error.response.data, status: "error", duration: 5000, isClosable: true, position: "bottom" });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent bg={modalBg} backdropFilter="blur(16px)" borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontSize="28px" fontFamily="Work sans" fontWeight="bold" textAlign="center" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center" pb={6}>
            <FormControl>
              <Input placeholder="Chat Name" mb={3} variant="filled" bg={inputBg} borderRadius="lg" onChange={(e) => setGroupChatName(e.target.value)} />
            </FormControl>
            <FormControl>
              <Input placeholder="Add Users eg: John, Piyush" mb={3} variant="filled" bg={inputBg} borderRadius="lg" onChange={(e) => handleSearch(e.target.value)} />
            </FormControl>
            
            <Box w="100%" d="flex" flexWrap="wrap" mb={2}>
              {selectedUsers.map((u) => <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />)}
            </Box>
            
            {loading ? <div style={{ color: "gray" }}>Loading...</div> : searchResult?.slice(0, 4).map((user) => <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />)}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue" borderRadius="full" boxShadow="md" w="100%">Create Chat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;