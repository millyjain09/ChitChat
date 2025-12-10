// import {
//   Box,
//   Text,
//   Image,
//   IconButton,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   Tooltip,
//   Input,
//   Button,
//   HStack,
//   useToast
// } from "@chakra-ui/react";
// import {
//   FaFilePdf, FaFileAlt, FaFileImage, FaFileVideo,
//   FaArrowLeft, FaPlay, FaEllipsisV, FaTrash, FaEdit, FaReply, FaChevronDown, FaCheck
// } from "react-icons/fa";
// import { BsCheck, BsCheckAll } from "react-icons/bs";
// import ScrollableFeed from "react-scrollable-feed";
// import { ChatState } from "../Context/ChatProvider";
// import { useState, useRef } from "react";
// import axios from "axios";

// // ✅ Receives setReplyMessage from Parent
// function ScrollableChat({ messages, setMessages, socket, setReplyMessage }) { 
//   const { user } = ChatState();
//   const toast = useToast();
  
//   // Preview & Edit States
//   const [previewSrc, setPreviewSrc] = useState(null);
//   const [previewType, setPreviewType] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [editContent, setEditContent] = useState("");

//   const videoRef = useRef(null);
//   const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

//   // --- Helper: File Icons ---
//   const getFileIcon = (fileType) => {
//     if (!fileType) return <FaFileAlt size={22} />;
//     if (fileType.startsWith("image/")) return <FaFileImage size={22} />;
//     if (fileType.startsWith("video/")) return <FaFileVideo size={22} />;
//     if (fileType === "application/pdf") return <FaFilePdf size={22} />;
//     return <FaFileAlt size={22} />;
//   };

//   // --- ACTION: Delete ---
//   const handleDelete = async (id) => {
//       if(!window.confirm("Are you sure you want to delete this message?")) return;
//       try {
//           const config = { headers: { Authorization: `Bearer ${user.token}` } };
//           await axios.delete(`/api/message/${id}`, config);
          
//           // Instant UI Update
//           const updatedMessages = messages.map(m => 
//              m._id === id ? { ...m, isDeleted: true, content: "This message was deleted", file: null } : m
//           );
//           setMessages(updatedMessages);
//           toast({ title: "Message Deleted", status: "success", duration: 2000, isClosable: true });
//       } catch (error) {
//           toast({ title: "Failed to delete", status: "error", duration: 2000 });
//       }
//   };

//   // --- ACTION: Edit ---
//   const handleEditStart = (m) => {
//       setEditingId(m._id);
//       setEditContent(m.content);
//   };

//   const handleEditSave = async (id) => {
//       try {
//           const config = { headers: { Authorization: `Bearer ${user.token}` } };
//           await axios.put(`/api/message/edit`, { messageId: id, newContent: editContent }, config);
          
//           // Instant UI Update
//           const updatedMessages = messages.map(m => 
//             m._id === id ? { ...m, content: editContent, isEdited: true } : m
//           );
//           setMessages(updatedMessages);
//           setEditingId(null);
//           toast({ title: "Message Edited", status: "success", duration: 2000 });
//       } catch (error) {
//           toast({ title: "Failed to edit", status: "error", duration: 2000 });
//       }
//   };

//   // --- ACTION: Reply ---
//   const handleReply = (m) => {
//       if(setReplyMessage) {
//           setReplyMessage(m); // Pass to SingleChat logic
//       }
//   };

//   // --- Preview Helpers ---
//   const openPreview = (src, type) => { setPreviewSrc(src); setPreviewType(type); document.body.style.overflow = "hidden"; };
//   const closePreview = () => { setPreviewSrc(null); setPreviewType(null); document.body.style.overflow = ""; };

//   const getMessageTick = (status) => {
//     if (status === "seen") return <BsCheckAll color="#4FD1C5" size={18} style={{ marginLeft: 3 }} />;
//     if (status === "delivered") return <BsCheckAll color="white" size={18} style={{ marginLeft: 3 }} />;
//     return <BsCheck color="white" size={18} style={{ marginLeft: 3 }} />;
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return "";
//     return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   return (
//     <>
//       <ScrollableFeed className="messages">
//         {messages &&
//           messages.map((m, i) => {
//             const senderId = m?.sender?._id || m?.sender;
//             const isOwn = senderId?.toString() === user?._id?.toString();
//             const fileType = m.fileType || "";
//             const fileUrl = m.file?.startsWith("http") ? m.file : `${apiUrl}${m.file || ""}`;
//             const fileName = m.fileName || fileUrl.split("/").pop();
//             const isDeleted = m.isDeleted;

//             return (
//               <Box
//                 key={m._id || i}
//                 display="flex"
//                 justifyContent={isOwn ? "flex-end" : "flex-start"}
//                 mb={2}
//                 px={2}
//                 // ✅ Group Role for Hover
//                 role="group" 
//                 position="relative"
//               >
//                 {/* --- MENU BUTTON (Correctly Positioned Outside Bubble) --- */}
//                 {!isDeleted && (
//                   <Box 
//                      display="flex" 
//                      alignItems="center" 
//                      mr={isOwn ? 1 : 0} 
//                      ml={!isOwn ? 1 : 0}
//                      opacity={0}
//                      _groupHover={{ opacity: 1 }}
//                      transition="opacity 0.2s"
//                      order={isOwn ? 1 : 2} // Show on left for received, right for sent
//                   >
//                      <Menu>
//                         <MenuButton as={IconButton} icon={<FaChevronDown />} size="xs" variant="ghost" borderRadius="full" />
//                         <MenuList minW="150px" zIndex={50}>
//                            <MenuItem icon={<FaReply />} onClick={() => handleReply(m)}>Reply</MenuItem>
//                            {isOwn && <MenuItem icon={<FaEdit />} onClick={() => handleEditStart(m)}>Edit</MenuItem>}
//                            {isOwn && <MenuItem icon={<FaTrash />} color="red.500" onClick={() => handleDelete(m._id)}>Delete</MenuItem>}
//                         </MenuList>
//                      </Menu>
//                   </Box>
//                 )}

//                 <Box
//                   order={isOwn ? 2 : 1}
//                   bg={isOwn ? "#2B6CB0" : "white"}
//                   color={isOwn ? "white" : "black"}
//                   borderRadius="xl"
//                   borderTopRightRadius={isOwn ? "2px" : "xl"}
//                   borderTopLeftRadius={!isOwn ? "2px" : "xl"}
//                   p="8px 14px"
//                   maxW="75%"
//                   boxShadow="sm"
//                   position="relative"
//                 >
//                   {/* --- REPLY BUBBLE (If this msg is a reply) --- */}
//                   {m.replyTo && (
//                       <Box bg="rgba(0,0,0,0.1)" p={2} mb={2} borderRadius="md" borderLeft="4px solid orange" cursor="pointer">
//                           <Text fontWeight="bold" fontSize="xs" color="orange.300">
//                               {m.replyTo.sender?.name || "User"}
//                           </Text>
//                           <Text fontSize="xs" noOfLines={1} opacity={0.9}>
//                               {m.replyTo.content || (m.replyTo.file ? "Attachment" : "Message deleted")}
//                           </Text>
//                       </Box>
//                   )}

//                   {/* Sender Name */}
//                   {m?.chat?.isGroupChat && !isOwn && m?.sender?.name && (
//                       <Text fontSize="xs" fontWeight="bold" color="orange.500" mb={1} textTransform="capitalize">
//                         {m.sender.name}
//                       </Text>
//                   )}

//                   {/* --- DELETED MSG UI --- */}
//                   {isDeleted ? (
//                       <Text fontStyle="italic" color="gray.400" fontSize="sm">
//                          <FaTrash style={{display:'inline', marginRight:'5px'}}/> This message was deleted
//                       </Text>
//                   ) : (
//                       <>
//                           {/* Media */}
//                           {fileType.startsWith("image/") && <Image src={fileUrl} borderRadius="lg" maxW="250px" mb={2} cursor="pointer" onClick={() => openPreview(fileUrl, "image")} />}
//                           {fileType.startsWith("video/") && (
//                              <Box position="relative" mb={2} onClick={() => openPreview(fileUrl, "video")} cursor="pointer">
//                                 <video src={fileUrl} style={{ maxWidth: "250px" }} muted />
//                                 <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)"><FaPlay color="white"/></Box>
//                              </Box>
//                           )}

//                           {/* Content / Edit Mode */}
//                           {editingId === m._id ? (
//                               <HStack>
//                                   <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} size="sm" bg="white" color="black" autoFocus />
//                                   <Button size="xs" colorScheme="green" onClick={() => handleEditSave(m._id)}><FaCheck /></Button>
//                                   <Button size="xs" colorScheme="red" onClick={() => setEditingId(null)}>X</Button>
//                               </HStack>
//                           ) : (
//                               <>
//                                 {m.content && <Text fontSize="15px">{m.content}</Text>}
//                                 {m.isEdited && <Text fontSize="9px" textAlign="right" opacity={0.7}>(edited)</Text>}
//                               </>
//                           )}
//                       </>
//                   )}

//                   {/* Time & Tick */}
//                   <HStack justifyContent="flex-end" spacing={1} mt={1}>
//                     <Text fontSize="9px" opacity={0.8}>{formatTime(m.createdAt)}</Text>
//                     {isOwn && !isDeleted && getMessageTick(m.status)}
//                   </HStack>
//                 </Box>
//               </Box>
//             );
//           })}
//       </ScrollableFeed>
//       {/* Preview Modal Logic (Same as before) */}
//       {previewSrc && (
//         <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="black" zIndex={9999} display="flex" justifyContent="center" alignItems="center">
//            <IconButton icon={<FaArrowLeft/>} onClick={closePreview} position="absolute" top={5} left={5} />
//            {previewType === "video" ? <video src={previewSrc} controls autoPlay style={{maxHeight:"90vh"}}/> : <Image src={previewSrc} maxH="90vh"/>}
//         </Box>
//       )}
//     </>
//   );
// }

// export default ScrollableChat;


import {
  Box,
  Text,
  Image,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Input,
  Button,
  HStack,
  useToast
} from "@chakra-ui/react";
import {
  FaFilePdf, FaFileAlt, FaFileImage, FaFileVideo,
  FaArrowLeft, FaPlay, FaEllipsisV, FaTrash, FaEdit, FaReply, FaChevronDown, FaCheck
} from "react-icons/fa";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import { useState, useRef } from "react";
import axios from "axios";

// ✅ Receives setReplyMessage from Parent
function ScrollableChat({ messages, setMessages, socket, setReplyMessage }) { 
  const { user } = ChatState();
  const toast = useToast();
  
  // Preview & Edit States
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const videoRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // --- Helper: File Icons ---
  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFileAlt size={22} />;
    if (fileType.startsWith("image/")) return <FaFileImage size={22} />;
    if (fileType.startsWith("video/")) return <FaFileVideo size={22} />;
    if (fileType === "application/pdf") return <FaFilePdf size={22} />;
    return <FaFileAlt size={22} />;
  };

  // --- ACTION: Delete ---
  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this message?")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`/api/message/${id}`, config);
          
          // Instant UI Update
          const updatedMessages = messages.map(m => 
              m._id === id ? { ...m, isDeleted: true, content: "This message was deleted", file: null } : m
          );
          setMessages(updatedMessages);
          toast({ title: "Message Deleted", status: "success", duration: 2000, isClosable: true });
      } catch (error) {
          toast({ title: "Failed to delete", status: "error", duration: 2000 });
      }
  };

  // --- ACTION: Edit ---
  const handleEditStart = (m) => {
      setEditingId(m._id);
      setEditContent(m.content);
  };

  const handleEditSave = async (id) => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/message/edit`, { messageId: id, newContent: editContent }, config);
          
          // Instant UI Update
          const updatedMessages = messages.map(m => 
            m._id === id ? { ...m, content: editContent, isEdited: true } : m
          );
          setMessages(updatedMessages);
          setEditingId(null);
          toast({ title: "Message Edited", status: "success", duration: 2000 });
      } catch (error) {
          toast({ title: "Failed to edit", status: "error", duration: 2000 });
      }
  };

  // --- ACTION: Reply ---
  const handleReply = (m) => {
      if(setReplyMessage) {
          setReplyMessage(m); // Pass to SingleChat logic
      }
  };

  // --- Preview Helpers ---
  const openPreview = (src, type) => { setPreviewSrc(src); setPreviewType(type); document.body.style.overflow = "hidden"; };
  const closePreview = () => { setPreviewSrc(null); setPreviewType(null); document.body.style.overflow = ""; };

  const getMessageTick = (status) => {
    if (status === "seen") return <BsCheckAll color="#4FD1C5" size={18} style={{ marginLeft: 3 }} />;
    if (status === "delivered") return <BsCheckAll color="white" size={18} style={{ marginLeft: 3 }} />;
    return <BsCheck color="white" size={18} style={{ marginLeft: 3 }} />;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <ScrollableFeed className="messages">
        {messages &&
          messages.map((m, i) => {
            const senderId = m?.sender?._id || m?.sender;
            const isOwn = senderId?.toString() === user?._id?.toString();
            const fileType = m.fileType || "";
            const fileUrl = m.file?.startsWith("http") ? m.file : `${apiUrl}${m.file || ""}`;
            const fileName = m.fileName || fileUrl.split("/").pop();
            const isDeleted = m.isDeleted;

            return (
              <Box
                key={m._id || i}
                display="flex"
                justifyContent={isOwn ? "flex-end" : "flex-start"}
                mb={2}
                px={2}
                // ✅ Group Role for Hover
                role="group" 
                position="relative"
              >
                {/* --- MENU BUTTON (Correctly Positioned Outside Bubble) --- */}
                {!isDeleted && (
                  <Box 
                      display="flex" 
                      alignItems="center" 
                      mr={isOwn ? 1 : 0} 
                      ml={!isOwn ? 1 : 0}
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.2s"
                      order={isOwn ? 1 : 2} // Show on left for received, right for sent
                  >
                      <Menu>
                          <MenuButton as={IconButton} icon={<FaChevronDown />} size="xs" variant="ghost" borderRadius="full" />
                          <MenuList minW="150px" zIndex={50}>
                             <MenuItem icon={<FaReply />} onClick={() => handleReply(m)}>Reply</MenuItem>
                             {isOwn && <MenuItem icon={<FaEdit />} onClick={() => handleEditStart(m)}>Edit</MenuItem>}
                             {isOwn && <MenuItem icon={<FaTrash />} color="red.500" onClick={() => handleDelete(m._id)}>Delete</MenuItem>}
                          </MenuList>
                      </Menu>
                  </Box>
                )}

                <Box
                  order={isOwn ? 2 : 1}
                  bg={isOwn ? "#2B6CB0" : "white"}
                  color={isOwn ? "white" : "black"}
                  borderRadius="xl"
                  borderTopRightRadius={isOwn ? "2px" : "xl"}
                  borderTopLeftRadius={!isOwn ? "2px" : "xl"}
                  p="8px 14px"
                  maxW="75%"
                  boxShadow="sm"
                  position="relative"
                >
                  {/* --- REPLY BUBBLE (If this msg is a reply) --- */}
                  {m.replyTo && (
                      <Box bg="rgba(0,0,0,0.1)" p={2} mb={2} borderRadius="md" borderLeft="4px solid orange" cursor="pointer">
                          <Text fontWeight="bold" fontSize="xs" color="orange.300">
                              {m.replyTo.sender?.name || "User"}
                          </Text>
                          <Text fontSize="xs" noOfLines={1} opacity={0.9}>
                              {m.replyTo.content || (m.replyTo.file ? "Attachment" : "Message deleted")}
                          </Text>
                      </Box>
                  )}

                  {/* Sender Name */}
                  {m?.chat?.isGroupChat && !isOwn && m?.sender?.name && (
                      <Text fontSize="xs" fontWeight="bold" color="orange.500" mb={1} textTransform="capitalize">
                        {m.sender.name}
                      </Text>
                  )}

                  {/* --- DELETED MSG UI --- */}
                  {isDeleted ? (
                      <Text fontStyle="italic" color="gray.400" fontSize="sm">
                          <FaTrash style={{display:'inline', marginRight:'5px'}}/> This message was deleted
                      </Text>
                  ) : (
                      <>
                          {/* Media: Image */}
                          {fileType.startsWith("image/") && <Image src={fileUrl} borderRadius="lg" maxW="250px" mb={2} cursor="pointer" onClick={() => openPreview(fileUrl, "image")} />}
                          
                          {/* Media: Video */}
                          {fileType.startsWith("video/") && (
                              <Box position="relative" mb={2} onClick={() => openPreview(fileUrl, "video")} cursor="pointer">
                                  <video src={fileUrl} style={{ maxWidth: "250px" }} muted />
                                  <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)"><FaPlay color="white"/></Box>
                              </Box>
                          )}
                            
                          {/* 📢 CRITICAL FIX: Document/Other File Rendering (NEW BLOCK) */}
                          {m.file && !fileType.startsWith("image/") && !fileType.startsWith("video/") && (
                              <Box 
                                  display="flex" 
                                  alignItems="center" 
                                  p={2} 
                                  mb={2} 
                                  bg={isOwn ? "rgba(255,255,255,0.2)" : "gray.100"}
                                  borderRadius="md" 
                                  cursor="pointer"
                                  position="relative" // For absolute link overlay
                              >
                                  <Box color={isOwn ? "white" : "gray.600"} mr={3}>
                                      {getFileIcon(fileType)}
                                  </Box>
                                  <Text 
                                      noOfLines={1} 
                                      fontSize="sm" 
                                      color={isOwn ? "white" : "black"}
                                      fontWeight="semibold"
                                  >
                                      {fileName}
                                  </Text>
                                  {/* Clickable link to download/open the file in a new tab */}
                                  <Tooltip label={`Download ${fileName}`} hasArrow>
                                      <a 
                                          href={fileUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          style={{ position: 'absolute', inset: 0 }} 
                                      />
                                  </Tooltip>
                              </Box>
                          )}
                          
                          {/* Content / Edit Mode */}
                          {editingId === m._id ? (
                              <HStack>
                                  <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} size="sm" bg="white" color="black" autoFocus />
                                  <Button size="xs" colorScheme="green" onClick={() => handleEditSave(m._id)}><FaCheck /></Button>
                                  <Button size="xs" colorScheme="red" onClick={() => setEditingId(null)}>X</Button>
                              </HStack>
                          ) : (
                              <>
                                {m.content && <Text fontSize="15px">{m.content}</Text>}
                                {m.isEdited && <Text fontSize="9px" textAlign="right" opacity={0.7}>(edited)</Text>}
                              </>
                          )}
                      </>
                  )}

                  {/* Time & Tick */}
                  <HStack justifyContent="flex-end" spacing={1} mt={1}>
                    <Text fontSize="9px" opacity={0.8}>{formatTime(m.createdAt)}</Text>
                    {isOwn && !isDeleted && getMessageTick(m.status)}
                  </HStack>
                </Box>
              </Box>
            );
          })}
      </ScrollableFeed>
      {/* Preview Modal Logic (Same as before) */}
      {previewSrc && (
        <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="black" zIndex={9999} display="flex" justifyContent="center" alignItems="center">
           <IconButton icon={<FaArrowLeft/>} onClick={closePreview} position="absolute" top={5} left={5} />
           {previewType === "video" ? <video src={previewSrc} controls autoPlay style={{maxHeight:"90vh"}}/> : <Image src={previewSrc} maxH="90vh"/>}
        </Box>
      )}
    </>
  );
}

export default ScrollableChat;