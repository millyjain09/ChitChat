import { Box, Text, Image, IconButton, Menu, MenuButton, MenuList, MenuItem, Tooltip, Input, Button, HStack, useToast, useColorModeValue, Badge } from "@chakra-ui/react";
import { FaFilePdf, FaFileAlt, FaFileImage, FaFileVideo, FaArrowLeft, FaPlay, FaChevronDown, FaTrash, FaEdit, FaReply, FaCheck, FaCopy } from "react-icons/fa";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";
import axios from "axios";
import "./styles.css";

function ScrollableChat({ messages, setMessages, socket, setReplyMessage }) { 
  const { user } = ChatState();
  const toast = useToast();
  
  // States
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Colors
  const myMsgBg = "linear-gradient(to right, #f093fb, #f5576c)";
  const otherMsgBg = useColorModeValue("white", "gray.700");
  const myMsgColor = "white";
  const otherMsgColor = useColorModeValue("gray.800", "white");
  const timeColorMy = "rgba(255,255,255,0.8)";
  const timeColorOther = useColorModeValue("gray.500", "gray.400");
  const dateBadgeBg = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.15)");

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFileAlt size={22} />;
    if (fileType.startsWith("image/")) return <FaFileImage size={22} />;
    if (fileType.startsWith("video/")) return <FaFileVideo size={22} />;
    if (fileType === "application/pdf") return <FaFilePdf size={22} />;
    return <FaFileAlt size={22} />;
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this message?")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`/api/message/${id}`, config);
          const updatedMessages = messages.map(m => m._id === id ? { ...m, isDeleted: true, content: "This message was deleted", file: null } : m);
          setMessages(updatedMessages);
          toast({ title: "Deleted", status: "success", duration: 1000 });
      } catch (error) { toast({ title: "Failed", status: "error", duration: 1000 }); }
  };

  const handleEditSave = async (id) => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/message/edit`, { messageId: id, newContent: editContent }, config);
          const updatedMessages = messages.map(m => m._id === id ? { ...m, content: editContent, isEdited: true } : m);
          setMessages(updatedMessages);
          setEditingId(null);
      } catch (error) { toast({ title: "Failed", status: "error", duration: 1000 }); }
  };

  const handleCopy = (content) => {
      navigator.clipboard.writeText(content);
      toast({ title: "Copied!", status: "info", duration: 1000, position: "bottom" });
  };

  const openPreview = (src, type) => { setPreviewSrc(src); setPreviewType(type); };
  const closePreview = () => { setPreviewSrc(null); setPreviewType(null); };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isDifferentDay = (m1, m2) => {
      if (!m2) return true; 
      const d1 = new Date(m1.createdAt).toDateString();
      const d2 = new Date(m2.createdAt).toDateString();
      return d1 !== d2;
  };

  const formatDateBadge = (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString();
  };

  return (
    <>
      <ScrollableFeed className="messages">
        {messages && messages.map((m, i) => {
            const senderId = m?.sender?._id || m?.sender;
            const isOwn = senderId?.toString() === user?._id?.toString();
            
            // 🔥 FILE DETECTION & PATH FIX
            // Checks if 'm.file' exists. Handles full URLs (Cloudinary) or Relative paths (Localhost)
            const hasFile = m.file && m.file.length > 0;
            const fileUrl =
  m.file?.startsWith("http")
    ? m.file
    : `http://localhost:5000${m.file}`;

            if (fileUrl && fileUrl.startsWith('/uploads')) {
                fileUrl = `${apiUrl}${fileUrl}`;
            }
            
            let isImage = false;
            let isVideo = false;
            let fileName = "File";

            if(hasFile) {
                // Get filename from URL
                fileName = m.fileName || fileUrl.split("/").pop();
                const fileExt = fileName.split('.').pop().toLowerCase();
                
                // 🔥 SMART CHECK: Checks file extension OR fileType from DB
                isImage = (m.fileType && m.fileType.startsWith("image/")) || ['jpg','jpeg','png','gif','webp', 'bmp'].includes(fileExt);
                isVideo = (m.fileType && m.fileType.startsWith("video/")) || ['mp4','webm','mov', 'mkv', 'avi'].includes(fileExt);
            }

            const isDeleted = m.isDeleted;
            const showDate = isDifferentDay(m, messages[i - 1]);

            return (
              <Box key={m._id || i}>
                {showDate && (
                    <Box display="flex" justifyContent="center" my={4}>
                        <Badge bg={dateBadgeBg} color="gray.500" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="bold" boxShadow="sm">
                            {formatDateBadge(m.createdAt)}
                        </Badge>
                    </Box>
                )}

                <Box display="flex" justifyContent={isOwn ? "flex-end" : "flex-start"} mb={3} px={2} role="group" position="relative" className="msg-animate">
                    
                    {!isDeleted && (
                    <Box display="flex" alignItems="center" mr={isOwn ? 1 : 0} ml={!isOwn ? 1 : 0} opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s" order={isOwn ? 1 : 2}>
                        <Menu>
                            <MenuButton as={IconButton} icon={<FaChevronDown />} size="xs" variant="ghost" borderRadius="full" />
                            <MenuList minW="150px" zIndex={50}>
                                <MenuItem icon={<FaReply />} onClick={() => setReplyMessage && setReplyMessage(m)}>Reply</MenuItem>
                                {m.content && <MenuItem icon={<FaCopy />} onClick={() => handleCopy(m.content)}>Copy</MenuItem>}
                                {isOwn && <MenuItem icon={<FaEdit />} onClick={() => { setEditingId(m._id); setEditContent(m.content); }}>Edit</MenuItem>}
                                {isOwn && <MenuItem icon={<FaTrash />} color="red.500" onClick={() => handleDelete(m._id)}>Delete</MenuItem>}
                            </MenuList>
                        </Menu>
                    </Box>
                    )}

                    <Box order={isOwn ? 2 : 1}
                    bg={isOwn ? "transparent" : otherMsgBg}
                    bgGradient={isOwn ? myMsgBg : "none"}
                    color={isOwn ? myMsgColor : otherMsgColor}
                    borderRadius="2xl"
                    borderBottomRightRadius={isOwn ? "2px" : "2xl"}
                    borderBottomLeftRadius={!isOwn ? "2px" : "2xl"}
                    p="10px 16px"
                    maxW="75%"
                    boxShadow="md"
                    position="relative"
                    minW="100px" // Ensure bubble is never invisible
                    >
                    {m.replyTo && (
                        <Box bg="rgba(0,0,0,0.1)" p={2} mb={2} borderRadius="md" borderLeft="3px solid white" cursor="pointer">
                            <Text fontWeight="bold" fontSize="xs" opacity={0.9}>{m.replyTo.sender?.name || "User"}</Text>
                            <Text fontSize="xs" noOfLines={1} opacity={0.8}>{m.replyTo.content || "Media"}</Text>
                        </Box>
                    )}

                    {m?.chat?.isGroupChat && !isOwn && m?.sender?.name && (
                        <Text fontSize="xs" fontWeight="bold" color="pink.400" mb={1} textTransform="capitalize">{m.sender.name}</Text>
                    )}

                    {isDeleted ? (
                        <Text fontStyle="italic" opacity={0.7} fontSize="sm"><FaTrash style={{display:'inline', marginRight:'5px'}}/> Deleted</Text>
                    ) : (
                        <>
                            {/* 🔥 RENDER MEDIA IF PRESENT */}
                            {hasFile && (
                                <Box mb={m.content ? 2 : 0}>
                                    {isImage && (
                                      <Image
  src={fileUrl}
  borderRadius="lg"
  maxW="250px"
  cursor="pointer"
  onClick={() => openPreview(fileUrl, "image")}
  boxShadow="sm"
  objectFit="cover"
/>

                                    )}
                                    
                                    {isVideo && (
                                        <Box position="relative" mb={2} onClick={() => openPreview(fileUrl, "video")} cursor="pointer">
                                            <video src={fileUrl} style={{ maxWidth: "250px", borderRadius: "10px" }} muted />
                                            <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)"><FaPlay color="white" size={20}/></Box>
                                        </Box>
                                    )}
                                    
                                    {/* Fallback for Docs or Unknown File Types */}
                                    {(!isImage && !isVideo) && (
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <HStack bg="rgba(0,0,0,0.1)" p={3} borderRadius="md" spacing={3}>
                                                <Box color={isOwn ? "white" : "gray.600"}>{getFileIcon(m.fileType)}</Box>
                                                <Text fontSize="sm" fontWeight="bold" noOfLines={1} color={isOwn ? "white" : "black"}>{fileName}</Text>
                                            </HStack>
                                        </a>
                                    )}
                                </Box>
                            )}
                            
                            {/* Render Text Content */}
                            {editingId === m._id ? (
                                <HStack>
                                    <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} size="sm" bg="white" color="black" autoFocus />
                                    <Button size="xs" colorScheme="green" onClick={() => handleEditSave(m._id)}><FaCheck /></Button>
                                    <Button size="xs" colorScheme="red" onClick={() => setEditingId(null)}>X</Button>
                                </HStack>
                            ) : (
                                <Text fontSize="15px" lineHeight="1.4">{m.content}</Text>
                            )}
                        </>
                    )}

                    <HStack justifyContent="flex-end" spacing={1} mt={1}>
                        <Text fontSize="9px" color={isOwn ? timeColorMy : timeColorOther}>{formatTime(m.createdAt)} {m.isEdited && "(edited)"}</Text>
                        {isOwn && !isDeleted && (m.status === "seen" ? <BsCheckAll color="#68D391" size={16}/> : <BsCheckAll color="rgba(255,255,255,0.7)" size={16}/>)}
                    </HStack>
                    </Box>
                </Box>
              </Box>
            );
          })}
      </ScrollableFeed>

      {/* PREVIEW MODAL */}
      {previewSrc && (
        <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="rgba(0,0,0,0.9)" zIndex={9999} display="flex" justifyContent="center" alignItems="center" backdropFilter="blur(5px)">
           <IconButton icon={<FaArrowLeft/>} onClick={closePreview} position="absolute" top={5} left={5} colorScheme="whiteAlpha" isRound />
           {previewType === "video" ? <video src={previewSrc} controls autoPlay style={{maxHeight:"90vh", maxWidth:"90vw"}}/> : <Image src={previewSrc} maxH="90vh" maxW="90vw"/>}
        </Box>
      )}
    </>
  );
}

export default ScrollableChat;