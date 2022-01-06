import { Badge, Button, Card, Group, Text, useMantineTheme } from "@mantine/core";
import Image from "next/image";
import { sandbox } from "../public/collections/sandbox";
import styled from "styled-components";
import { Grid } from "@mantine/core";

const CollectionWrapper = styled.div`
  &:hover {
    box-shadow: rgb(4 17 29 / 25%) 0px 0px 8px 0px;
    transition: all 0.1s ease 0s;
  }
  cursor: pointer;
`;

const CImage = styled(Image)`
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

const EllipsisDiv = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const Collections = () => {
  const theme = useMantineTheme();

  const secondaryColor = theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[7];

  return (
    <div>
      <Grid>
        {sandbox.map((token, i) => {
          return token.tokenURI === null ? null : (
            <Grid.Col span={12} md={6} lg={4} key={i}>
              <CollectionWrapper
                style={{
                  width: 380,
                  margin: "20px auto",
                  border: "1px solid rgb(229, 232, 235)",
                  borderRadius: "10px",
                }}
              >
                <div>
                  {token?.tokenURI && (
                    <CImage
                      unoptimized={true}
                      src={token.tokenURI}
                      width="380px"
                      height="200px"
                      layout="responsive"
                      objectFit="cover"
                      alt=""
                    />
                  )}
                </div>
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "50%",
                    margin: "0 auto",
                    marginTop: "-30px",
                    position: "relative",
                    border: "1px solid grey",
                    backgroundColor: "white",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      margin: "0 auto",
                      marginTop: "3px",
                      position: "relative",
                      backgroundImage: `url(${token.tokenURI})`,
                    }}
                  ></div>
                </div>
                <div style={{ height: "180px", overflow: "hidden", padding: "0 10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "30%",
                      overflow: "hidden",
                      fontWeight: "bold",
                    }}
                  >
                    {token.name}
                  </div>
                  <EllipsisDiv style={{ height: "50%", overflow: "hidden" }}>
                    <p
                      style={{
                        wordWrap: "break-word",
                        width: "100%",
                        textAlign: "center",
                        textOverflow: "ellipsis",
                        whiteSpace: "initial",
                      }}
                    >
                      {token?.description}
                    </p>
                  </EllipsisDiv>
                </div>
              </CollectionWrapper>
            </Grid.Col>
          );
        })}
      </Grid>
    </div>
  );
};

export default Collections;
