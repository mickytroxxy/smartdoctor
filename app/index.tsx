import useAuth from "@/src/hooks/useAuth";
import Login from "./(auth)/login";
import HomeScreen from "./Home";

export default function Index() {
  const { accountInfo } = useAuth();
  if (!accountInfo) {
    return <Login />;
  }
  return <HomeScreen />;
}
