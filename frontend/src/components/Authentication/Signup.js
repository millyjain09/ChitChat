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

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);


  const isPasswordStrong = (pwd) => {
 // Minimum 8 characters
 if (pwd.length < 8) return { valid: false, message: "Password must be at least 8 characters long." };
 // At least one special character (non-alphanumeric)
 if (!/[^A-Za-z0-9]/.test(pwd)||!/[A-Z]/.test(pwd)||!/[a-z]/.test(pwd)||!/[0-9]/.test(pwd)) return { valid: false, message: "Password must include at least one special character (e.g., !, @, #),an UpperCase and an lowecase" };



return { valid: true, message: "" };
 };

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    const validationResult = isPasswordStrong(password);
 if (!validationResult.valid) {
toast({
 title: "Password Requirement Failed",
 description: validationResult.message, // Detailed error message
 status: "error", 
duration: 6000,
isClosable: true,
 position: "bottom",
 });
setPicLoading(false);
 return;
 }

    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    console.log(name, email, password, pic);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        config
      );
      console.log(data);
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    console.log(pics);
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
          setPic(data.url.toString());
          console.log(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  return (
    <VStack spacing="15px">
      <FormControl id="first-name" isRequired>
        <FormLabel fontWeight="bold" color="gray.600">Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          variant="filled"
          bg="gray.100"
          focusBorderColor="blue.500"
          borderRadius="xl"
          onChange={(e) => setName(e.target.value)}
          _hover={{ bg: "gray.200" }}
          py={6}
        />
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel fontWeight="bold" color="gray.600">Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email Address"
          variant="filled"
          bg="gray.100"
          focusBorderColor="blue.500"
          borderRadius="xl"
          onChange={(e) => setEmail(e.target.value)}
          _hover={{ bg: "gray.200" }}
          py={6}
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel fontWeight="bold" color="gray.600">Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            variant="filled"
            bg="gray.100"
            focusBorderColor="blue.500"
            borderRadius="xl"
            onChange={(e) => setPassword(e.target.value)}
            _hover={{ bg: "gray.200" }}
            py={6}
          />
          <InputRightElement width="4.5rem" h="100%">
            <Button 
                h="1.75rem" 
                size="sm" 
                variant="ghost" 
                onClick={handleClick}
                _hover={{ bg: "transparent", color: "blue.500" }}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="confirmpassword" isRequired>
        <FormLabel fontWeight="bold" color="gray.600">Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            variant="filled"
            bg="gray.100"
            focusBorderColor="blue.500"
            borderRadius="xl"
            onChange={(e) => setConfirmpassword(e.target.value)}
            _hover={{ bg: "gray.200" }}
            py={6}
          />
          <InputRightElement width="4.5rem" h="100%">
            <Button 
                h="1.75rem" 
                size="sm" 
                variant="ghost" 
                onClick={handleClick}
                _hover={{ bg: "transparent", color: "blue.500" }}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic">
        <FormLabel fontWeight="bold" color="gray.600">Upload your Picture</FormLabel>
        <Input
          type="file"
          p={2}
          accept="image/*"
          variant="filled"
          bg="gray.100"
          borderRadius="xl"
          sx={{
            "::file-selector-button": {
              height: "90%",
              mr: 4,
              border: "none",
              bg: "blue.100",
              color: "blue.700",
              fontWeight: "bold",
              borderRadius: "md",
              cursor: "pointer",
              transition: "all .2s"
            },
            "::file-selector-button:hover": {
               bg: "blue.200"
            }
          }}
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      <Button
        bgGradient="linear(to-r, blue.400, blue.600)"
        color="white"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={picLoading}
        borderRadius="xl"
        boxShadow="md"
        _hover={{
            bgGradient: "linear(to-r, blue.500, blue.700)",
            boxShadow: "lg",
            transform: "translateY(-1px)",
        }}
        _active={{
            bgGradient: "linear(to-r, blue.600, blue.800)",
            transform: "translateY(0px)",
        }}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;