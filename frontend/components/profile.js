import { ActionIcon, Menu } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import { BiUserCircle } from "react-icons/bi";
import { useStore } from "../utils/store";

export const disconnectWallet = async ({ setAccount, setUser }) => {
  setAccount(null);
  setUser(null);
};

const Profile = () => {
  const router = useRouter();
  const [setAccount, setUser] = useStore((state) => [state.setAccount, state.setUser]);

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
      <Menu.Item style={{ fontSize: "18px" }} onClick={() => disconnectWallet({ setAccount, setUser })}>
        Disconnect
      </Menu.Item>
      <Menu.Item style={{ fontSize: "18px" }} onClick={() => router.push("/mypage")}>
        My Page
      </Menu.Item>
    </Menu>
  );
};

export default Profile;
