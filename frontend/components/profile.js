import { ActionIcon, Menu } from "@mantine/core";
import { useRouter } from "next/router";
import { BiUserCircle } from "react-icons/bi";
import { useStore } from "../utils/store";

export const disconnectWallet = async ({ setAccount, setUser, setNetworkId }) => {
  setAccount(null);
  setUser(null);
  setNetworkId(null);
};

const Profile = () => {
  const router = useRouter();
  const [setAccount, setUser, setNetworkId] = useStore((state) => [
    state.setAccount,
    state.setUser,
    state.setNetworkId,
  ]);

  return (
    <Menu
      controlRefProp="ref"
      control={
        <ActionIcon size={36} style={{ cursor: "auto" }}>
          <BiUserCircle style={{ width: "40px", height: "40px" }} />
        </ActionIcon>
      }
      trigger="hover"
      delay={200}
    >
      <Menu.Item style={{ fontSize: "18px" }} onClick={() => disconnectWallet({ setAccount, setUser, setNetworkId })}>
        Disconnect
      </Menu.Item>
      <Menu.Item style={{ fontSize: "18px" }} onClick={() => router.push("/mypage")}>
        My Page
      </Menu.Item>
    </Menu>
  );
};

export default Profile;
