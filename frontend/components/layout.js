import { useState } from "react";
import { AppShell, Burger, Button, Header, MediaQuery, Navbar, Text, useMantineTheme } from "@mantine/core";
import Image from "next/image";
import { Input } from "@mantine/core";
import Link from "next/link";
import styled from "styled-components";
import Profile from "./profile";

const CText = styled(Text)`
  && {
    margin: 0 20px;
    cursor: pointer;
  }
`;

const Layout = ({ children }) => {
  const [opened, setOpened] = useState(false);
  const [account, setAccount] = useState("");
  const theme = useMantineTheme();

  const connectWallet = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log(accounts);

    setAccount(accounts[0]);
    console.log(accounts[0]);
  };

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
            <Text>Application navbar</Text>
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
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <Input style={{ marginRight: "20px", width: "300px" }} variant="default" placeholder="Search" />

              <div style={{ display: "flex" }}>
                <Link href="/collections" passHref>
                  <CText>Collections</CText>
                </Link>

                <Link href="/nfts" passHref>
                  <CText>nfts</CText>
                </Link>

                <Link href="/create" passHref>
                  <CText>Create</CText>
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              {account && <Profile />}

              <Button style={{ marginLeft: "20px" }} onClick={connectWallet} variant="light" color="orange">
                <Image width={28} height={28} src="https://docs.metamask.io/metamask-fox.svg" alt="" />
                <span style={{ marginLeft: "10px" }}>지갑 연결</span>
              </Button>
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
