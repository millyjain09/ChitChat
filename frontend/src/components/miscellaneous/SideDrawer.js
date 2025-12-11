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
  display="flex"
  flexDirection={{ base: "row", md: "row" }}
  justifyContent="space-between"
  alignItems="center"
  bg="white"
  w="100%"
  p="10px 20px"
  boxShadow="sm"
  borderBottom="1px solid"
  borderColor="gray.200"
  position="sticky"
  top="0"
  zIndex="100"
>

  {/* LEFT: Logo + Search */}
  <Box display="flex" alignItems="center" gap={3}>
    <Image 
      src="https://cdn.dribbble.com/userupload/24457794/file/original-706f9e480ddfdd83b7d8460b58bea7a6.jpg" 
      h="40px" 
      w="40px"
    />

    <Tooltip label="Search Users">
      <Button variant="ghost" onClick={onOpen} borderRadius="lg">
        <i className="fas fa-search" style={{ color: "#4A5568" }}></i>
      </Button>
    </Tooltip>
  </Box>

  {/* CENTER: Title */}
  <Text
    fontSize="24px"
    fontFamily="Work sans"
    fontWeight="bold"
    bgGradient="linear(to-r, blue.500, purple.500)"
    bgClip="text"
    textAlign="center"
  >
    Chit-Chat
  </Text>

  {/* RIGHT: Bell + Profile in same row */}
  <Box display="flex" alignItems="center" gap={3}>
    
    {/* 🔔 Notification */}
    <Menu>
      <MenuButton p={1} borderRadius="full" _hover={{ bg: "gray.100" }}>
        <NotificationBadge count={notification.length} effect={Effect.SCALE} />
        <BellIcon fontSize="2xl" color="gray.600" />
      </MenuButton>

      <MenuList>
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
              ? `New message in ${notif.chat.chatName}`
              : `Message from ${getSender(user, notif.chat.users)}`}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>

    {/* 👤 Profile Dropdown */}
    <Menu>
      <MenuButton 
        as={Button} 
        bg="white" 
        rightIcon={<ChevronDownIcon />} 
        borderRadius="lg"
      >
        <Avatar
          size="sm"
          name={user.name}
          src={user.pic}
          border="2px solid blue"
        />
      </MenuButton>

      <MenuList>
        <ProfileModal user={user}>
          <MenuItem>My Profile</MenuItem>
        </ProfileModal>
        <MenuDivider />
        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
      </MenuList>
    </Menu>

  </Box>

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