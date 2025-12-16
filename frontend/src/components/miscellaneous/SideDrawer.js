import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuDivider, MenuItem, MenuList } from "@chakra-ui/menu";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, DrawerCloseButton } from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon, SearchIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Avatar, AvatarBadge } from "@chakra-ui/avatar";
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
import { useColorMode, useColorModeValue, HStack, IconButton } from "@chakra-ui/react";
import { FaComments } from "react-icons/fa";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { setSelectedChat, user, notification, setNotification, chats, setChats } = ChatState();
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Colors
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(23, 25, 35, 0.8)");
  const searchBarBg = useColorModeValue("rgba(0, 0, 0, 0.05)", "rgba(255, 255, 255, 0.1)");
  const logoColor1 = "#f093fb";
  const logoColor2 = "#f5576c";
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const menuBg = useColorModeValue("white", "gray.800");

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({ title: "Please Enter something in search", status: "warning", duration: 5000, isClosable: true, position: "top-left" });
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({ title: "Error Occured!", description: "Failed to Load the Search Results", status: "error", duration: 5000, isClosable: true, position: "bottom-left" });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({ title: "Error fetching the chat", description: error.message, status: "error", duration: 5000, isClosable: true, position: "bottom-left" });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg={glassBg}
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor={useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.1)")}
        w="100%"
        px={{ base: "10px", md: "25px" }}
        py="12px"
        position="sticky"
        top="0"
        zIndex="100"
        boxShadow="0px 4px 15px rgba(0,0,0,0.05)"
      >
        
        {/* SEARCH BAR */}
        <Tooltip label="Search Users" hasArrow placement="bottom">
          <Button variant="ghost" onClick={onOpen} bg={searchBarBg} borderRadius="full" px={4} height="40px" _hover={{ bg: "rgba(0,0,0,0.1)", transform: "scale(1.02)" }} transition="all 0.2s" display="flex" alignItems="center" gap={2}>
            <SearchIcon color={iconColor} />
            <Text display={{ base: "none", md: "flex" }} fontSize="sm" color="gray.500" fontWeight="normal">Search user...</Text>
          </Button>
        </Tooltip>

        {/* LOGO */}
        <HStack spacing={2} cursor="pointer" onClick={() => history.push("/")}>
            <Box bgGradient={`linear(to-br, ${logoColor1}, ${logoColor2})`} p={1.5} borderRadius="lg" boxShadow="md" display={{ base: "none", md: "block" }}>
                <FaComments color="white" size="20px"/>
            </Box>
            <Text fontSize={{ base: "22px", md: "26px" }} fontFamily="Work sans" fontWeight="900" letterSpacing="tight" bgGradient={`linear(to-r, ${logoColor1}, ${logoColor2})`} bgClip="text" color="transparent" style={{ textShadow: "0px 2px 10px rgba(245, 87, 108, 0.2)" }}>
              Chit-Chat
            </Text>
        </HStack>

        {/* RIGHT MENU */}
        <HStack spacing={{ base: 2, md: 4 }}>
          
          <IconButton onClick={toggleColorMode} icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />} variant="ghost" borderRadius="full" color={iconColor} aria-label="Toggle Theme"/>

          {/* Notifications */}
          <Menu>
            <MenuButton p={1} position="relative">
              <NotificationBadge count={notification.length} effect={Effect.SCALE} />
              <BellIcon fontSize="2xl" color={iconColor} />
            </MenuButton>
            <MenuList bg={menuBg} borderColor="whiteAlpha.300" boxShadow="xl" borderRadius="xl">
              {!notification.length && <MenuItem>No New Messages</MenuItem>}
              {notification.map((notif) => (
                <MenuItem key={notif._id} onClick={() => { setSelectedChat(notif.chat); setNotification(notification.filter((n) => n !== notif)); }}>
                  {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Profile Dropdown */}
          <Menu>
            <MenuButton as={Button} bg="transparent" rightIcon={<ChevronDownIcon color={iconColor} />} variant="unstyled" display="flex" alignItems="center">
              {/* ✅ KEY Added: Forces update when pic changes */}
              <Avatar 
                key={user.pic} 
                size="sm" 
                cursor="pointer" 
                name={user.name} 
                src={user.pic} 
                border="2px solid" 
                borderColor={logoColor2}
              >
                 <AvatarBadge boxSize="1em" bg="green.500" border="2px solid white" />
              </Avatar>
            </MenuButton>
            <MenuList bg={menuBg} borderColor="whiteAlpha.300" boxShadow="xl" borderRadius="xl">
              <ProfileModal user={user}><MenuItem fontWeight="bold">My Profile</MenuItem></ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler} color="red.400" fontWeight="bold">Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>

      {/* DRAWER */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay bg="rgba(0,0,0,0.3)" backdropFilter="blur(5px)" />
        <DrawerContent bg={menuBg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" fontFamily="Work sans">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2} gap={2}>
              <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="full" focusBorderColor="pink.400"/>
              <Button onClick={handleSearch} bgGradient={`linear(to-r, ${logoColor1}, ${logoColor2})`} color="white" borderRadius="full" _hover={{ opacity: 0.9 }}>Go</Button>
            </Box>
            {loading ? <ChatLoading /> : searchResult?.map((user) => <UserListItem key={user._id} user={user} handleFunction={() => accessChat(user._id)} />)}
            {loadingChat && <Spinner ml="auto" display="flex" color="pink.500" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;