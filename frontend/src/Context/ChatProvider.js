import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const ChatContext = createContext();

export const ChatState = () => {
  return useContext(ChatContext);
};

const ENDPOINT = "http://localhost:5000";

const ChatProvider = ({ children }) => {
  const history = useHistory();
  const toast = useToast();

  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [onlineUsers, setOnlineUsers] = useState([]); 

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const connectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const ringtoneRef = useRef(null);
  
  const callStartTimeRef = useRef(null); 
    
    // ✅ ADDED: State for robust call tracking (as per your request)
    const [callTargetId, setCallTargetId] = useState(null); 
    const [receiverName, setReceiverName] = useState(""); 

  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callIsVideo, setCallIsVideo] = useState(false);
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  // ✅ NEW: State for current call duration display
  const [currentCallDuration, setCurrentCallDuration] = useState('0:00');

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (!userInfo) history.push("/");
    try {
        ringtoneRef.current = new Audio("/ringtone.mp3"); 
        ringtoneRef.current.loop = true;
    } catch (e) {}
  }, [history]);
  
  // ✅ NEW: Effect to manage call duration timer
  useEffect(() => {
    let interval;
    if (callAccepted && callActive) {
      interval = setInterval(() => {
        if (callStartTimeRef.current) {
          const ms = Date.now() - callStartTimeRef.current;
          setCurrentCallDuration(formatDuration(ms));
        }
      }, 1000);
    } else {
      setCurrentCallDuration('0:00');
      if (interval) clearInterval(interval);
    }
    
    return () => { if (interval) clearInterval(interval); };
  }, [callAccepted, callActive]);

  useEffect(() => {
    if (!user) return;
    socketRef.current = io(ENDPOINT);
    socketRef.current.emit("setup", user);
    socketRef.current.on("connected", () => console.log("Socket Connected"));
    socketRef.current.on("user online", (users) => setOnlineUsers(users));
    socketRef.current.on("user offline", (userId) => setOnlineUsers((prev) => prev.filter((id) => id !== userId)));
    
    socketRef.current.on("callUser", ({ from, name: callerName, signal, isVideo }) => {
      setIncomingCall({ from, callerName, signal, isVideo });
      setCallTargetId(from); // Store caller's ID as the target
      setReceiverName(callerName); // Store caller's name
      setCallIsVideo(isVideo);
      try { ringtoneRef.current?.play().catch(e => {}); } catch(e){}
    });

    socketRef.current.on("callAccepted", (signal) => {
       setCallAccepted(true);
       callStartTimeRef.current = Date.now(); 
    });

    // Listener for when caller rejects the call
    socketRef.current.on("callRejected", () => {
        setCallActive(false);
        setCallAccepted(false);
        setIncomingCall(null);
        callStartTimeRef.current = null;
        setCallTargetId(null); 
        setReceiverName("");
        toast({ title: "Call Rejected", status: "error", duration: 2000 }); 
        setTimeout(() => { window.location.reload(); }, 1000);
    });

    // Sunne wala logic (Jab samne wala call kaate)
    socketRef.current.on("leaveCall", () => {
        setCallEnded(true);
        setCallActive(false);
        setIncomingCall(null);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        window.location.reload(); // Screen refresh karke band kar do
    });

    return () => { if(socketRef.current) socketRef.current.disconnect(); };
  }, [user]);

  const formatDuration = (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // ✅ Helper function to get the name of the user on the other side of the call
  const getOtherUserName = () => {
    if (incomingCall && !callAccepted) return incomingCall.callerName;
    if (receiverName) return receiverName; // Use stored name if available
    if (selectedChat && user) {
       const otherUser = selectedChat.users.find(u => u._id !== user._id);
       return otherUser ? otherUser.name : "Unknown User";
    }
    return "Connecting...";
  };

  const startCall = (idToCall, isVideo = false) => {
    setCallIsVideo(isVideo);
    setCallActive(true);
    setCallEnded(false);
    callStartTimeRef.current = Date.now(); 

    // ✅ UPDATE: Store target user ID and name on initiating call
    setCallTargetId(idToCall);
    const otherUser = selectedChat.users.find(u => u._id === idToCall);
    setReceiverName(otherUser ? otherUser.name : "Unknown User");


    navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        localStreamRef.current = currentStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = currentStream;

        const peer = new SimplePeer({ initiator: true, trickle: false, stream: currentStream });

        peer.on("signal", (data) => {
          socketRef.current.emit("callUser", {
            userToCall: idToCall,
            signalData: data,
            from: user._id,
            name: user.name,
            isVideo: isVideo
          });
        });

        peer.on("stream", (currentRemoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = currentRemoteStream;
        });

        socketRef.current.on("callAccepted", (signal) => {
          setCallAccepted(true);
          peer.signal(signal);
          callStartTimeRef.current = Date.now(); 
        });

        connectionRef.current = peer;
      })
      .catch((err) => console.error("Failed to get stream", err));
  };

  const answerCall = () => {
    setCallAccepted(true);
    callStartTimeRef.current = Date.now(); 
    // ✅ UPDATE: Store target user ID and name on answering call
    setCallTargetId(incomingCall.from);
    setReceiverName(incomingCall.callerName);

    try { ringtoneRef.current?.pause(); ringtoneRef.current.currentTime = 0; } catch(e){}

    navigator.mediaDevices.getUserMedia({ video: callIsVideo, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        localStreamRef.current = currentStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = currentStream;

        const peer = new SimplePeer({ initiator: false, trickle: false, stream: currentStream });

        peer.on("signal", (data) => {
          socketRef.current.emit("answerCall", { signal: data, to: incomingCall.from });
        });

        peer.on("stream", (currentRemoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = currentRemoteStream;
        });

        peer.signal(incomingCall.signal);
        connectionRef.current = peer;
      })
      .catch((err) => console.error("Failed to get stream", err));
      
    setCallActive(true);
    setIncomingCall(null);
  };

 const declineCall = () => {
    // Check if there is a caller (incomingCall) and emit event to them
    if(incomingCall?.from) {
        socketRef.current.emit("rejectCall", { to: incomingCall.from });
    }
    setIncomingCall(null);
    try { ringtoneRef.current?.pause(); ringtoneRef.current.currentTime = 0; } catch(e){}
    setReceiverName(""); // Reset receiver name
    setCallTargetId(null); // Reset target ID
  };

// ✅ REPLACED: Updated leaveCall logic based on your request
const leaveCall = async () => {
    setCallEnded(true);
    
    // 1. Get Target User ID Reliably
    const targetUserId = callTargetId; 
    
    // 2. Send 'endCall' signal to the stored target ID (Server-side fix)
    if (targetUserId && socketRef.current) {
        console.log(`[CLIENT LEAVE] Emitting endCall to stored target: ${targetUserId}`);
        socketRef.current.emit("endCall", { id: targetUserId }); 
    } else {
        console.log("[CLIENT LEAVE] Could not emit endCall. Target ID missing.");
    }

    // 3. Destroy WebRTC connection and stop media tracks
    if (connectionRef.current) connectionRef.current.destroy();
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // 4. Call Log Save Logic (ONLY runs if chat context is available)
    if(selectedChat) { 
        let duration = "0:00";
        if (callStartTimeRef.current) {
            const ms = Date.now() - callStartTimeRef.current;
            duration = formatDuration(ms > 1000 ? ms : 1000);
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post("/api/message/logcall", {
                chatId: selectedChat._id,
                callDuration: duration, 
                callStatus: "Ended",
                callType: callIsVideo ? "Video" : "Audio"
            }, config);
            
            // Only emit new message if data is successfully received
            if (data && socketRef.current) {
                socketRef.current.emit("new message", data);
            }
            toast({ title: "Call Saved", status: "success", duration: 2000 }); 
        } catch (error) {
            console.log("Error logging call:", error);
            // Agar API fail ho jaye, toh bhi call toh band honi chahiye
        }
    }

    // 5. FINAL UI/State CLEANUP
    setCallActive(false);
    setCallAccepted(false);
    setIncomingCall(null);
    callStartTimeRef.current = null;
    setReceiverName(""); 
    setCallTargetId(null); 
    
    setTimeout(() => {
        window.location.reload(); 
    }, 1000);
};


  const contextValue = {
    selectedChat, setSelectedChat,
    user, setUser,
    notification, setNotification,
    chats, setChats,
    socket: socketRef.current,
    onlineUsers,
    startCall, answerCall, declineCall, leaveCall,
    incomingCall, callActive, callIsVideo, callAccepted, callEnded,
    myVideo: localVideoRef, userVideo: remoteVideoRef, stream
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
      {incomingCall && !callAccepted && (
        <div style={styles.overlay}>
           <div style={styles.card}>
              <h2 style={{marginBottom:'10px', fontSize:'22px'}}>Incoming {callIsVideo ? "Video" : "Audio"} Call...</h2>
              <h3 style={{marginBottom:'20px', color:'#555'}}>{incomingCall.callerName} is calling</h3>
              <div style={{display:'flex', justifyContent:'center', gap:'20px'}}>
                 <button onClick={answerCall} style={{...styles.btn, backgroundColor:'#25D366'}}>Answer</button>
                 <button onClick={declineCall} style={{...styles.btn, backgroundColor:'#FF3B30'}}>Decline</button>
              </div>
           </div>
        </div>
      )}
      {callActive && (
        <div style={styles.callContainer}>
             {/* ✅ NEW: Call Info Overlay */}
             <div style={styles.callInfoOverlay}>
                 <h1 style={styles.callName}>{getOtherUserName()}</h1>
                 <p style={styles.callStatus}>
                    {callAccepted ? `Active Call (${currentCallDuration})` : "Calling..."}
                 </p>
             </div>
             
             {/* Remote Video: Render only when accepted */}
             {callAccepted && !callEnded && <video playsInline ref={remoteVideoRef} autoPlay style={styles.videoMain} />}
             
             {/* Local Video: Render only when stream is available AND it is a video call */}
             {stream && callActive && callIsVideo && <video playsInline muted ref={localVideoRef} autoPlay style={styles.videoSmall} />}
             
             <div style={styles.controls}>
                {/* The call cut button already exists here */}
                <button onClick={leaveCall} style={{...styles.btn, backgroundColor:'#FF3B30', padding:'10px 30px'}}>End Call</button>
             </div>
        </div>
      )}
    </ChatContext.Provider>
  );
};

const styles = {
    overlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent:'center', alignItems:'center', zIndex: 9999 },
    card: { background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', minWidth: '300px' },
    btn: { padding: '10px 20px', border: 'none', borderRadius: '30px', color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
    callContainer: { position: 'fixed', top:0, left:0, width: '100vw', height: '100vh', backgroundColor: '#222', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    videoMain: { width: '100%', height: '100%', objectFit: 'cover' },
    videoSmall: { position: 'absolute', bottom: '100px', right: '20px', width: '150px', height: '200px', objectFit: 'cover', borderRadius: '10px', border: '2px solid white', zIndex: 10000 },
    controls: { position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 10001 },
    // ✅ NEW STYLES
    callInfoOverlay: { position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 10002, textAlign: 'center', color: 'white', textShadow: '0 0 5px rgba(0,0,0,0.8)' },
    callName: { fontSize: '28px', margin: '0 0 5px 0' },
    callStatus: { fontSize: '16px', color: '#ccc' }
};

export default ChatProvider;