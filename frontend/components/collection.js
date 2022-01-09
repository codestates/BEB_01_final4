import { Grid } from "@mantine/core";
import Image from "next/image";
import styled from "styled-components";
import { useRouter } from "next/router";

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

const Collection = ({ collection }) => {
  const router = useRouter();

  return (
    <Grid.Col
      span={12}
      md={6}
      lg={4}
      onClick={() => {
        router.push(`/collections/${collection.name}`);
      }}
    >
      <CollectionWrapper
        style={{
          width: 380,
          margin: "20px auto",
          border: "1px solid rgb(229, 232, 235)",
          borderRadius: "10px",
        }}
      >
        <div>
          {collection.assets[0].tokenURI && (
            <CImage
              unoptimized={true}
              src={collection.assets[0].tokenURI}
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
              backgroundImage: `url(${collection.large_image_url})`,
              backgroundSize: "cover",
              // backgroundRepeat: "no-repeat",
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
            {collection.name}
            <div style={{ display: "flex", fontSize: "24px", margin: "0px 4px", cursor: "pointer" }}>
              <Image src="/images/verified.png" width="36px" height="36px" alt="" />
            </div>
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
              {collection.description}
            </p>
          </EllipsisDiv>
        </div>
      </CollectionWrapper>
    </Grid.Col>
  );
};

export default Collection;
