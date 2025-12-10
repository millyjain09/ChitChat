import { Stack } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";

const ChatLoading = () => {
  return (
    <Stack spacing={3}>
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
      <Skeleton height="50px" borderRadius="xl" startColor="gray.100" endColor="gray.300" />
    </Stack>
  );
};

export default ChatLoading;