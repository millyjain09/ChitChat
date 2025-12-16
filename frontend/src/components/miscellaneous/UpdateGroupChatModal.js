import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, useDisclosure, FormControl, Input, useToast, Box, IconButton, Spinner, useColorModeValue
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();
  
  // Theme
  const modalBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(23, 25, 35, 0.9)");

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
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/rename`, { chatId: selectedChat._id, chatName: groupChatName }, config);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({ title: "Error Occured!", description: error.response.data.message, status: "error", duration: 5000, isClosable: true, position: "bottom" });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({ title: "User Already in group!", status: "error", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({ title: "Only admins can add someone!", status: "error", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/groupadd`, { chatId: selectedChat._id, userId: user1._id }, config);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({ title: "Error Occured!", description: error.response.data.message, status: "error", duration: 5000, isClosable: true, position: "bottom" });
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({ title: "Only admins can remove someone!", status: "error", duration: 5000, isClosable: true, position: "bottom" });
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/groupremove`, { chatId: selectedChat._id, userId: user1._id }, config);
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({ title: "Error Occured!", description: error.response.data.message, status: "error", duration: 5000, isClosable: true, position: "bottom" });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} variant="ghost" />
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent bg={modalBg} backdropFilter="blur(16px)" borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontSize="28px" fontFamily="Work sans" fontWeight="bold" textAlign="center">{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center" pb={6}>
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => <UserBadgeItem key={u._id} user={u} admin={selectedChat.groupAdmin} handleFunction={() => handleRemove(u)} />)}
            </Box>
            <FormControl d="flex">
              <Input placeholder="Chat Name" mb={3} value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} variant="filled" borderRadius="lg" />
              <Button variant="solid" colorScheme="blue" ml={2} isLoading={renameloading} onClick={handleRename} borderRadius="lg">Update</Button>
            </FormControl>
            <FormControl>
              <Input placeholder="Add User to group" mb={1} onChange={(e) => handleSearch(e.target.value)} variant="filled" borderRadius="lg" />
            </FormControl>
            {loading ? <Spinner size="lg" color="blue.500" mt={4} /> : searchResult?.map((user) => <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />)}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red" w="100%" borderRadius="full">Leave Group</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;