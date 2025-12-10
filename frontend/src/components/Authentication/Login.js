import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
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
      setLoading(false);
    }
  };

  return (
    <VStack spacing="15px">
      <FormControl id="email" isRequired>
        <FormLabel fontWeight="bold" color="gray.600">Email Address</FormLabel>
        <Input
          value={email}
          type="email"
          variant="filled"
          bg="gray.100"
          focusBorderColor="blue.500"
          borderRadius="xl"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
          _hover={{ bg: "gray.200" }}
          py={6} // Thoda height badhaya hai comfortable typing ke liye
        />
      </FormControl>
      
      <FormControl id="password" isRequired>
        <FormLabel fontWeight="bold" color="gray.600">Password</FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            variant="filled"
            bg="gray.100"
            focusBorderColor="blue.500"
            borderRadius="xl"
            placeholder="Enter password"
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

      <Button
        bgGradient="linear(to-r, blue.400, blue.600)"
        color="white"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
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
        Login
      </Button>

      {/* <Button
        variant="outline"
        colorScheme="red"
        width="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
        borderRadius="xl"
        border="2px"
        _hover={{
            bg: "red.50",
            borderColor: "red.600"
        }}
      >
        Get Guest User Credentials
      </Button> */}
    </VStack>
  );
};

export default Login;