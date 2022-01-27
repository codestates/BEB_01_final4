import { Grid } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import { CImage, CollectionWrapper, EllipsisDiv } from "./styles";

const DaoCard = ({ dao }) => {
  const router = useRouter();

  return (
    <Grid.Col
      span={4}
      md={6}
      lg={4}
      onClick={() => {
        router.push(`/dao/${dao.daoAddress}`);
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
        {/* <div>
          {dao.banner_url && (
            <CImage
              unoptimized={true}
              // src={collection.assets[0].tokenURI}
              src={dao.banner_url}
              width="380px"
              height="200px"
              layout="responsive"
              objectFit="cover"
              alt=""
            />
          )}
        </div> */}
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
          {/* <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              margin: "0 auto",
              marginTop: "3px",
              position: "relative",
              backgroundImage: `url(${dao.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div> */}
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
              fontSize: "20px",
            }}
          >
            {dao.name}
            <div style={{ display: "flex", fontSize: "24px", margin: "0px 4px", cursor: "pointer" }}>
              <Image src="/images/verified.png" width="36px" height="36px" alt="" />
            </div>
          </div>
          <EllipsisDiv>
            <p
              style={{
                wordWrap: "break-word",
                width: "100%",
                textAlign: "center",
                textOverflow: "ellipsis",
                whiteSpace: "initial",
                fontSize: "18px",
              }}
            >
              {dao.description}
            </p>
          </EllipsisDiv>
        </div>
      </CollectionWrapper>
    </Grid.Col>
  );
};

export default DaoCard;
