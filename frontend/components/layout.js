import { useState } from "react";
import { AppShell, Badge, Burger, Button, Header, MediaQuery, Navbar, Text, useMantineTheme } from "@mantine/core";
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

const CText = styled(Text)`
  && {
    margin: 0 20px;
    cursor: pointer;
  }
`;

const CButton = styled(Button)`
  margin-bottom: 10px;
`;

export const connectWallet = async ({ setAccount, setUser }) => {
  let accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  setAccount(Web3.utils.toChecksumAddress(accounts[0]));

  try {
    const {
      data: { data: newUser },
    } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/users`, {
      address: accounts[0],
    });
    console.log(newUser);
    if (newUser) {
      setUser(newUser);
    }
  } catch (e) {
    console.log(e.response);
  }
};

const Layout = ({ children }) => {
  const [opened, setOpened] = useState(false);
  const [account, setAccount] = useStore((state) => [state.account, state.setAccount]);
  const setUser = useStore((state) => state.setUser);
  const [search, setSearch] = useInputState("");
  const router = useRouter();
  const theme = useMantineTheme();

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
                        fontSize: "25px",
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
                <div style={{ display: "flex" }}>
                  <Link href="/explore-collections" passHref>
                    <CText>Explore</CText>
                  </Link>
                  <Link href="/create" passHref>
                    <CText>Create</CText>
                  </Link>
                </div>
              </MediaQuery>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              {account && <Badge>{account.slice(0, 4) + "..." + account.slice(-4)}</Badge>}
              {account && <Profile />}

              {!account && (
                <Button
                  style={{ marginLeft: "20px" }}
                  onClick={() => connectWallet({ setAccount, setUser })}
                  variant="light"
                  color="orange"
                >
                  <Image width={28} height={28} src="https://docs.metamask.io/metamask-fox.svg" alt="" />
                  <span style={{ marginLeft: "10px" }}>지갑 연결</span>
                </Button>
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
