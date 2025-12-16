import { ViewIcon, EditIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  useColorModeValue,
  Avatar,
  AvatarBadge,
  Box,
  Tooltip,
  Spinner
} from "@chakra-ui/react";
import { FaCamera, FaUserEdit, FaCheck, FaTimes } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user: loggedUser, setUser } = ChatState();
  
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Theme Colors
  const modalBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(23, 25, 35, 0.95)");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const badgeBorder = useColorModeValue("white", "gray.800");

  // Local States
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "Hey there! I am using Chit-Chat.");
  const [pic, setPic] = useState(user.pic);
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false); // Alag loading state pic ke liye

  // Data Sync (Jab modal khule)
  useEffect(() => {
      setName(user.name);
      setPic(user.pic);
      setBio(user.bio || "Hey there! I am using Chit-Chat.");
  }, [user, isOpen]);

  // 🔥 CORE FIX: Cloudinary Upload Logic
  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({ title: "Please Select an Image!", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app"); 
      data.append("cloud_name", "piyushproj"); 

      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString()); // ✅ Nayi URL set hui
          setPicLoading(false);
          toast({ title: "Image Uploaded! Click Save to apply.", status: "success", duration: 3000, position: "top" });
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({ title: "Please Select an Image (jpeg/png)!", status: "warning", duration: 5000, position: "bottom" });
      setPicLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
        const config = {
            headers: {
                "Content-Type": "application/json", 
                Authorization: `Bearer ${loggedUser.token}`,
            },
        };

        // Backend ko data bhejo
        const { data } = await axios.put("/api/user/profile", {
            name: name,
            bio: bio,
            pic: pic // ✅ Ye wahi pic URL hai jo abhi Cloudinary se aayi
        }, config);

        // ✅ CRITICAL FIX: Context update karte waqt dhyan rakho
        // Hum backend data + local pic URL dono use karenge taaki revert na ho
        const updatedUserInfo = { ...loggedUser, ...data, pic: pic };
        
        setUser(updatedUserInfo);
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

        toast({ title: "Profile Updated Successfully!", status: "success", duration: 3000 });
        setEditMode(false);
        setLoading(false);

    } catch (error) {
        toast({ title: "Error Updating Profile", description: error.response?.data?.message || error.message, status: "error", duration: 3000 });
        setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} variant="ghost" />
      )}

      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(5px)" />
        <ModalContent bg={modalBg} backdropFilter="blur(10px)" borderRadius="2xl" boxShadow="2xl" pb={4}>
          <ModalHeader fontSize="28px" fontFamily="Work sans" textAlign="center" color={textColor} fontWeight="bold">
            {editMode ? "Edit Profile" : "Profile"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody d="flex" flexDir="column" alignItems="center">
            
            {/* AVATAR SECTION */}
            <Box position="relative" mb={6}>
                {picLoading ? (
                    <Spinner size="xl" color="purple.500" thickness="4px" />
                ) : (
                    <Avatar 
                        size="2xl" 
                        name={name} 
                        src={pic} 
                        border="4px solid" 
                        borderColor="purple.400"
                        boxShadow="lg"
                    >
                        {!editMode && <AvatarBadge boxSize="0.8em" bg="green.500" border="3px solid" borderColor={badgeBorder}/>}
                    </Avatar>
                )}

                {/* Camera Icon */}
                {editMode && (
                    <Tooltip label="Change Photo">
                        <IconButton 
                            icon={<FaCamera />} 
                            isRound 
                            size="md"
                            position="absolute" 
                            bottom="0px" 
                            right="0px" 
                            colorScheme="purple" 
                            boxShadow="lg"
                            zIndex={2}
                            onClick={() => fileInputRef.current.click()} 
                        />
                    </Tooltip>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    accept="image/*" 
                    onChange={(e) => postDetails(e.target.files[0])} 
                />
            </Box>

            {/* INFO FORM */}
            <VStack spacing={5} w="100%" px={8}>
                <FormControl>
                    <FormLabel textAlign="center" fontWeight="bold" color={subTextColor} fontSize="xs" letterSpacing="widest">NAME</FormLabel>
                    {editMode ? (
                        <Input value={name} onChange={(e) => setName(e.target.value)} textAlign="center" fontWeight="bold" variant="filled" bg="blackAlpha.100" />
                    ) : (
                        <Text fontSize="26px" fontWeight="bold" textAlign="center" color={textColor} textTransform="capitalize">{name}</Text>
                    )}
                </FormControl>

                <FormControl>
                    <FormLabel textAlign="center" fontWeight="bold" color={subTextColor} fontSize="xs" letterSpacing="widest">EMAIL</FormLabel>
                    <Text fontSize="16px" textAlign="center" color={textColor} fontWeight="medium">{user.email}</Text>
                </FormControl>

                <FormControl>
                    <FormLabel textAlign="center" fontWeight="bold" color={subTextColor} fontSize="xs" letterSpacing="widest">BIO</FormLabel>
                    {editMode ? (
                        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} textAlign="center" placeholder="Tell us about yourself..." resize="none" variant="filled" bg="blackAlpha.100"/>
                    ) : (
                        <Box p={4} bg="blackAlpha.50" borderRadius="xl" w="100%" textAlign="center">
                            <Text fontSize="16px" fontStyle="italic" color={textColor} opacity={0.8}>
                                "{bio}"
                            </Text>
                        </Box>
                    )}
                </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter justifyContent="center" gap={4}>
            {editMode ? (
                <>
                    <Button colorScheme="green" onClick={handleUpdate} isLoading={loading || picLoading} borderRadius="full" px={8} leftIcon={<FaCheck />}>Save</Button>
                    <Button variant="ghost" onClick={() => { setEditMode(false); setName(user.name); setPic(user.pic); }} borderRadius="full" leftIcon={<FaTimes />}>Cancel</Button>
                </>
            ) : (
                <>
                    {/* Sirf logged in user khud ko edit kar sake */}
                    {loggedUser && (loggedUser._id === user._id) && (
                        <Button leftIcon={<FaUserEdit />} colorScheme="blue" onClick={() => setEditMode(true)} borderRadius="full" px={6} boxShadow="md">
                            Edit Profile
                        </Button>
                    )}
                </>
            )}
            {!editMode && <Button onClick={onClose} borderRadius="full">Close</Button>}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;