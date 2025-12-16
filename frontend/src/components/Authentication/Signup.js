import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const history = useHistory();

  // ✅ Fix: Initialize with empty strings to avoid uncontrolled input warnings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  // Password Strength Check
  const isPasswordStrong = (pwd) => {
    if (pwd.length < 8) return { valid: false, message: "Password must be at least 8 characters long." };
    if (!/[^A-Za-z0-9]/.test(pwd) || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
        return { valid: false, message: "Password must include special char, Uppercase, Lowercase & Number" };
    }
    return { valid: true, message: "" };
  };

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({ title: "Please Fill all the Fields", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
      return;
    }

    const validationResult = isPasswordStrong(password);
    if (!validationResult.valid) {
      toast({ title: "Password Weak", description: validationResult.message, status: "error", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast({ title: "Passwords Do Not Match", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
      return;
    }

    try {
      const config = { headers: { "Content-type": "application/json" } };
      const { data } = await axios.post("/api/user", { name, email, password, pic }, config);
      
      toast({ title: "Registration Successful", status: "success", duration: 5000, isClosable: true, position: "bottom" });
      
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      history.push("/chats");
    } catch (error) {
      // ✅ Fix: Safer error handling
      toast({ 
          title: "Error Occured!", 
          description: error.response?.data?.message || "Something went wrong", 
          status: "error", 
          duration: 5000, 
          isClosable: true, 
          position: "bottom" 
      });
      setPicLoading(false);
    }
  };

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
      data.append("upload_preset", "chat-app"); // ⚠️ Make sure this matches your Cloudinary preset
      data.append("cloud_name", "piyushproj");  // ⚠️ Make sure this matches your Cloudinary cloud name
      
      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", { method: "post", body: data })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({ title: "Please Select an Image!", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
      return;
    }
  };

  // ✨ Common Glass Input Style
  const glassInputStyle = {
    bg: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    _placeholder: { color: "whiteAlpha.800" },
    _hover: { bg: "rgba(255, 255, 255, 0.3)" },
    _focus: { bg: "rgba(255, 255, 255, 0.4)", borderColor: "white" }
  };

  return (
    <VStack spacing="15px">
      <FormControl id="first-name" isRequired>
        <FormLabel color="white" fontWeight="bold" fontSize="sm">Name</FormLabel>
        <Input 
            placeholder="Enter Your Name" 
            onChange={(e) => setName(e.target.value)} 
            value={name}
            {...glassInputStyle} 
        />
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel color="white" fontWeight="bold" fontSize="sm">Email Address</FormLabel>
        <Input 
            type="email" 
            placeholder="Enter Your Email Address" 
            onChange={(e) => setEmail(e.target.value)} 
            value={email}
            {...glassInputStyle} 
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel color="white" fontWeight="bold" fontSize="sm">Password</FormLabel>
        <InputGroup size="md">
          <Input 
            type={show ? "text" : "password"} 
            placeholder="Enter Password" 
            onChange={(e) => setPassword(e.target.value)} 
            value={password}
            {...glassInputStyle} 
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" variant="ghost" onClick={handleClick} color="white" _hover={{ bg: "whiteAlpha.300" }}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="confirmpassword" isRequired>
        <FormLabel color="white" fontWeight="bold" fontSize="sm">Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input 
            type={show ? "text" : "password"} 
            placeholder="Confirm password" 
            onChange={(e) => setConfirmpassword(e.target.value)} 
            value={confirmpassword}
            {...glassInputStyle} 
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" variant="ghost" onClick={handleClick} color="white" _hover={{ bg: "whiteAlpha.300" }}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic">
        <FormLabel color="white" fontWeight="bold" fontSize="sm">Upload your Picture</FormLabel>
        <Input 
            type="file" 
            p={1.5} 
            accept="image/*" 
            {...glassInputStyle} 
            onChange={(e) => postDetails(e.target.files[0])} 
            sx={{ 
                "::file-selector-button": { 
                    height: "100%", 
                    mr: 4, 
                    border: "none", 
                    bg: "whiteAlpha.400", 
                    color: "white", 
                    fontWeight: "bold", 
                    borderRadius: "sm", 
                    cursor: "pointer" 
                } 
            }}
        />
      </FormControl>

      <Button 
        bgGradient="linear(to-r, #f093fb, #f5576c)" 
        color="white" 
        width="100%" 
        mt={4} 
        onClick={submitHandler} 
        isLoading={picLoading} 
        _hover={{ bgGradient: "linear(to-r, #d073db, #d5374c)", boxShadow: "lg", transform: "scale(1.02)" }}
        _active={{ transform: "scale(0.98)" }}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;