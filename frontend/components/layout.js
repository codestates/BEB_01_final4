import { useState } from "react";
import {
  ActionIcon,
  AppShell,
  Badge,
  Burger,
  Button,
  Header,
  MediaQuery,
  Menu,
  Navbar,
  Text,
  useMantineTheme,
} from "@mantine/core";
import Image from "next/image";
import { Input } from "@mantine/core";
import Link from "next/link";
import styled from "styled-components";
import Profile from "./profile";
import { useStore } from "../utils/store";
import axios from "axios";
import Web3 from "web3";
import { useInputState } from "@mantine/hooks";
import { useRouter } from "next/router";
import { compressAddress } from "../utils";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import caver from "caver-js";

const CText = styled(Text)`
  && {
    margin: 0 20px;
    cursor: pointer;
  }
`;

const CButton = styled(Button)`
  margin-bottom: 10px;
`;

const CHeader = styled.div`
  && * {
    font-size: 22px;
  }
`;

export const connectWallet = async ({ setAccount, setUser, setNetworkId }) => {
  let accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  // let networks = await window.ethereum.request({ method: "eth_chainId" });
  // console.log(networks);

  setAccount(Web3.utils.toChecksumAddress(accounts[0]));
  console.log(accounts[0]);
  const networkId = parseInt(window.ethereum.chainId, 16);
  console.log(networkId);
  setNetworkId(networkId);

  try {
    const {
      data: { data: newUser },
    } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/users`, {
      address: accounts[0],
    });
    // console.log(newUser);
    if (Object.keys(newUser).length !== 0) {
      setUser(newUser);
    }
  } catch (e) {
    console.log(e.response);
  }
};

export const connectKaikas = async ({ setAccount, setUser, setNetworkId }) => {
  const { klaytn } = window;

  if (klaytn) {
    try {
      await klaytn.enable();
      // klaytn.on("accountsChanged", () => console.log(klaytn));

      console.log(klaytn.selectedAddress);
      console.log(klaytn.networkVersion);
      const account = klaytn.selectedAddress;

      setAccount(caver.utils.toChecksumAddress(account));
      console.log(account);
      setNetworkId(klaytn.networkVersion);

      try {
        const {
          data: { data: newUser },
        } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/users`, {
          address: account,
        });
        // console.log(newUser);
        if (Object.keys(newUser).length !== 0) {
          setUser(newUser);
        }
      } catch (e) {
        console.log(e.response);
      }
    } catch (error) {
      console.log("User denied account access");
    }
  } else {
    console.log("Non-Kaikas browser detected. You should consider trying Kaikas!");
  }
};

const Layout = ({ children }) => {
  const [opened, setOpened] = useState(false);
  const [account, setAccount] = useStore((state) => [state.account, state.setAccount]);
  const setUser = useStore((state) => state.setUser);
  const [search, setSearch] = useInputState("");
  const router = useRouter();
  const theme = useMantineTheme();
  const [setWallet, setNetworkId] = useStore((state) => [state.setWallet, state.setNetworkId]);

  // kaikas - caver test 코드
  // const caver = useStore((state) => state.caver);

  // const getBalance = async () => {
  //   let balance = await caver.rpc.klay.getBalance(account);
  //   balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(balance), "KLAY");
  //   balance = caver.utils.convertFromPeb(balance, "KLAY");
  //   console.log(balance);
  // };

  return (
    <AppShell
      style={{ paddingRight: "calc(0px + 16px)" }}
      // navbarOffsetBreakpoint controls when navbar should no longer be offset with padding-left
      navbarOffsetBreakpoint="sm"
      // fixed prop on AppShell will be automatically added to Header and Navbar
      fixed
      navbar={
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Navbar
            style={{ marginTop: "70px" }}
            padding="md"
            // Breakpoint at which navbar will be hidden if hidden prop is true
            hiddenBreakpoint="sm"
            // Hides navbar when viewport size is less than value specified in hiddenBreakpoint
            hidden={!opened}
            // when viewport size is less than theme.breakpoints.sm navbar width is 100%
            // viewport size > theme.breakpoints.sm – width is 200px
            // viewport size > theme.breakpoints.lg – width is 300px
            // width={{ sm: 200, lg: 300 }}
            width={{ sm: 300, lg: 400 }}
          >
            <CButton variant="white" onClick={() => setOpened(!opened)}>
              <Link href="/" passHref>
                <CText>Home</CText>
              </Link>
            </CButton>
            <CButton variant="white" onClick={() => setOpened(!opened)}>
              <Link href="/explore-collections" passHref>
                <CText>Explore</CText>
              </Link>
            </CButton>
            <CButton variant="white" onClick={() => setOpened(!opened)}>
              <Link href="/create" passHref>
                <CText>Create</CText>
              </Link>
            </CButton>
            <CButton variant="white" onClick={() => setOpened(!opened)}>
              <Link href="/gganbu" passHref>
                <CText>GGanbu</CText>
              </Link>
            </CButton>
            <CButton variant="white" onClick={() => setOpened(!opened)}>
              <Link href="/daos" passHref>
                <CText>D A O</CText>
              </Link>
            </CButton>
          </Navbar>
        </MediaQuery>
      }
      header={
        <Header height={70} padding="md">
          {/* Handle other responsive styles with MediaQuery component or createStyles function */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
            <div style={{ display: "flex" }}>
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  style={{ alignSelf: "center" }}
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>

              <MediaQuery smallerThan="sm" styles={{ display: "none !important" }}>
                <div style={{ display: "flex", cursor: "pointer" }}>
                  <Image width="35" height="45" src="/images/gganbu.png" alt="" />
                  <Link href="/" passHref>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: "28px",
                        marginLeft: "10px",
                        alignSelf: "center",
                      }}
                    >
                      NFT GGanbu
                    </Text>
                  </Link>
                </div>
              </MediaQuery>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <Input
                value={search}
                onChange={setSearch}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(`/explore-collections?search=${search}`);
                  }
                }}
                style={{ marginRight: "20px", width: "300px" }}
                variant="default"
                placeholder="Search"
              />
              <MediaQuery smallerThan="sm" styles={{ display: "none !important" }}>
                <CHeader style={{ display: "flex" }}>
                  <Link href="/explore-collections" passHref>
                    <CText>Explore</CText>
                  </Link>
                  <Link href="/create" passHref>
                    <CText>Create</CText>
                  </Link>
                  <Link href="/gganbu" passHref>
                    <CText>GGanbu</CText>
                  </Link>
                  <Link href="/daos" passHref>
                    <CText>D A O</CText>
                  </Link>
                  {/* 
                  <CButton variant="white" onClick={getBalance}>
                    <CText>get balance</CText>
                  </CButton>
                  */}
                </CHeader>
              </MediaQuery>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              {account && <Badge radius={4} style={{ fontSize: "17px" }}>{`${compressAddress(account)}`}</Badge>}
              {account && <Profile />}

              {/* {!account && (
                <Button
                  style={{ marginLeft: "20px" }}
                  onClick={() => connectWallet({ setAccount, setUser })}
                  variant="light"
                  color="orange"
                >
                  <Image width={28} height={28} src="https://docs.metamask.io/metamask-fox.svg" alt="" />
                  <span style={{ marginLeft: "10px", fontSize: "20px" }}>Connect</span>
                </Button>
              )} */}

              {!account && (
                <Menu
                  controlRefProp="ref"
                  control={
                    <ActionIcon>
                      <MdOutlineAccountBalanceWallet style={{ width: 45, height: 45 }} />
                    </ActionIcon>
                  }
                  trigger="hover"
                  delay={200}
                >
                  <Menu.Item style={{ fontSize: "18px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center" }}
                      onClick={() => {
                        setWallet("metamask");
                        connectWallet({ setAccount, setUser, setNetworkId });
                      }}
                    >
                      <Image width={28} height={28} src="https://docs.metamask.io/metamask-fox.svg" alt="" />
                      <span style={{ marginLeft: "10px", fontSize: "20px" }}>Metamask</span>
                    </div>
                  </Menu.Item>
                  <Menu.Item style={{ fontSize: "18px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center" }}
                      onClick={() => {
                        setWallet("kaikas");
                        connectKaikas({ setAccount, setUser, setNetworkId });
                      }}
                    >
                      <Image
                        width={28}
                        height={28}
                        src="https://aws1.discourse-cdn.com/standard17/uploads/klaytn/original/1X/be6ab5b8b6246393c2c19d32ee75fab8e75f1157.jpeg"
                        alt=""
                      />
                      <span style={{ marginLeft: "10px", fontSize: "20px" }}>Kaikas</span>
                    </div>
                  </Menu.Item>
                </Menu>
              )}
            </div>
          </div>
        </Header>
      }
    >
      <Text>{children}</Text>
    </AppShell>
  );
};

export default Layout;
