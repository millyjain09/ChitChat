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
  Image,
  Box,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { FaCamera } from "react-icons/fa";
import React, { useState, useRef } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // CHANGES HERE: Humne 'user' ko 'loggedUser' rename kiya taaki conflict na ho
  const { user: loggedUser, setUser } = ChatState();
  
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Local State for Editing
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "Hey there! I am using Chit-Chat.");
  const [pic, setPic] = useState(user.pic);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setSelectedFile(file);
        setPic(URL.createObjectURL(file)); // Show preview immediately
    }
  };

  // Handle Update API
  const handleUpdate = async () => {
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("bio", bio);
        if (selectedFile) {
            formData.append("pic", selectedFile);
        }

        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${loggedUser.token}`, // Use loggedUser token
            },
        };

        const { data } = await axios.put("/api/user/profile", formData, config);

        // Update Context and LocalStorage
        // IMPORTANT: Hum sirf tab context update karenge agar hum khud ki profile edit kar rahe hain
        const updatedUserInfo = { ...loggedUser, ...data };
        setUser(updatedUserInfo);
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

        toast({ title: "Profile Updated Successfully", status: "success", duration: 3000 });
        setEditMode(false);
        setLoading(false);
    } catch (error) {
        toast({ title: "Error Updating Profile", status: "error", duration: 3000 });
        setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}

      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="auto" pb={4}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {editMode ? "Edit Profile" : "Profile"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody d="flex" flexDir="column" alignItems="center">
            
            {/* PROFILE PICTURE SECTION */}
            <Box position="relative" mb={4}>
                <Image
                  borderRadius="full"
                  boxSize="150px"
                  src={pic}
                  alt={name}
                  objectFit="cover"
                  border="4px solid"
                  borderColor="purple.500"
                />
                {editMode && (
                    <>
                        <Tooltip label="Change Picture">
                            <IconButton 
                                icon={<FaCamera />} 
                                isRound 
                                position="absolute" 
                                bottom="5px" 
                                right="5px" 
                                colorScheme="purple"
                                onClick={() => fileInputRef.current.click()}
                            />
                        </Tooltip>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: "none" }} 
                            accept="image/*"
                            onChange={handleFileChange} 
                        />
                    </>
                )}
            </Box>

            {/* INFO SECTION */}
            <VStack spacing={4} w="100%" px={5}>
                
                {/* Name */}
                <FormControl>
                    <FormLabel textAlign="center" fontWeight="bold" color="gray.500">Name</FormLabel>
                    {editMode ? (
                        <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            textAlign="center" 
                            fontSize="xl" 
                            fontWeight="bold"
                        />
                    ) : (
                        <Text fontSize="30px" fontFamily="Work sans" fontWeight="bold" textAlign="center">
                            {name}
                        </Text>
                    )}
                </FormControl>

                {/* Email (Read Only) */}
                <FormControl>
                    <FormLabel textAlign="center" fontWeight="bold" color="gray.500">Email</FormLabel>
                    <Text fontSize="18px" fontFamily="Work sans" textAlign="center" color="gray.600">
                        {user.email}
                    </Text>
                </FormControl>

                {/* Bio / About */}
                <FormControl>
                    <FormLabel textAlign="center" fontWeight="bold" color="gray.500">About</FormLabel>
                    {editMode ? (
                        <Textarea 
                            value={bio} 
                            onChange={(e) => setBio(e.target.value)} 
                            textAlign="center" 
                            placeholder="Tell us about yourself..."
                            resize="none"
                        />
                    ) : (
                        <Text fontSize="18px" fontFamily="Work sans" textAlign="center" fontStyle="italic" color="gray.700">
                            {bio || "Hey there! I am using Chit-Chat."}
                        </Text>
                    )}
                </FormControl>

            </VStack>
          </ModalBody>

          <ModalFooter justifyContent="center" gap={4}>
            {editMode ? (
                <>
                    <Button colorScheme="green" onClick={handleUpdate} isLoading={loading}>
                        Save Changes
                    </Button>
                    <Button colorScheme="red" onClick={() => setEditMode(false)}>
                        Cancel
                    </Button>
                </>
            ) : (
                // LOGIC FIXED HERE:
                // Hum check kar rahe hain ki kya loggedUser ki ID aur current Profile user ki ID same hai?
                // Agar same hai, tabhi Edit button dikhega.
                <>
                    {loggedUser && (loggedUser._id === user._id) && (
                        <Button leftIcon={<EditIcon />} colorScheme="blue" onClick={() => setEditMode(true)}>
                            Edit Profile
                        </Button>
                    )}
                </>
            )}
            {!editMode && <Button onClick={onClose}>Close</Button>}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;