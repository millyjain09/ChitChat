import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/react"; 
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${encodeURIComponent(search)}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="10px 20px"
        boxShadow="sm"
        borderBottom="1px solid"
        borderColor="gray.200"
        // ✅ FIX: Added zIndex to keep Header ON TOP of everything
        zIndex="100"
        position="sticky"
        top="0"
      >
        {/* Left Side: Logo + Search Button */}
        <Box d="flex" alignItems="center" gap={2}>
            <Image 
                src="https://cdn.dribbble.com/userupload/24457794/file/original-706f9e480ddfdd83b7d8460b58bea7a6.jpg?resize=752x&vertical=center" 
                h="40px" 
                w="40px" 
                mr={2} 
                cursor="pointer"
            />

            <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
            <Button 
                variant="ghost" 
                onClick={onOpen}
                _hover={{ bg: "gray.100" }}
                borderRadius="lg"
            >
                <i className="fas fa-search" style={{ color: "#4A5568" }}></i>
                <Text d={{ base: "none", md: "flex" }} px={4} fontWeight="500" color="gray.600">
                Search User
                </Text>
            </Button>
            </Tooltip>
        </Box>

        <Text 
            fontSize="2xl" 
            fontFamily="Work sans" 
            fontWeight="bold"
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
        >
          Chit-Chat
        </Text>

        <div>
          <Menu>
            <MenuButton p={1} borderRadius="full" _hover={{ bg: "gray.100" }}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} color="gray.600" />
            </MenuButton>
            <MenuList pl={2} boxShadow="lg" borderRadius="xl">
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton 
                as={Button} 
                bg="white" 
                rightIcon={<ChevronDownIcon color="gray.500" />}
                _hover={{ bg: "gray.50" }}
                _active={{ bg: "gray.100" }}
                borderRadius="lg"
                px={4}
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
                border="2px solid"
                borderColor="blue.400"
              />
            </MenuButton>
            <MenuList boxShadow="xl" borderRadius="xl" border="none" zIndex="101">
              <ProfileModal user={user}>
                <MenuItem _hover={{ bg: "gray.100", color: "blue.500" }} fontWeight="500">My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler} _hover={{ bg: "red.50", color: "red.500" }} fontWeight="500">Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay 
            bg="blackAlpha.300" 
            backdropFilter="blur(5px)" 
        />
        <DrawerContent>
          <DrawerCloseButton /> 
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.100" color="gray.700">
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2} mt={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                variant="filled"
                bg="gray.100"
                focusBorderColor="blue.500"
                borderRadius="lg"
              />
              <Button 
                onClick={handleSearch}
                bgGradient="linear(to-r, blue.400, blue.600)"
                color="white"
                _hover={{
                    bgGradient: "linear(to-r, blue.500, blue.700)",
                }}
                borderRadius="lg"
              >
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" mt={4} color="blue.500" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;