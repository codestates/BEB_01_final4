import { Grid, Button, Modal, Table, Text, TextInput } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import { CImage, CollectionWrapper, EllipsisDiv } from "./styles";
import styled from "styled-components";

const CTable = styled(Table)`
  && td {
    font-size: 16px;
  }

  && th {
    font-size: 16px;
  }
`;

const DaoCard = ({ dao }) => {
  const router = useRouter();

  //가짜 데이터
  if(dao.name == 'codestates-dao') {
    //없는 데이터만 등록
    dao._pool_usage = 0;
    dao._num_of_own_nft = 0;
    dao._num_of_lend_nft = 0;
  }
  else if(dao.name == 'korean whales') {
    //모든 정보 상세 페이지와 sync
    dao.num_of_members = 13;
    dao.balance = "2,342";
    dao.rewards = "413";

    dao._pool_usage = 62.69;
    dao._num_of_own_nft = 13;
    dao._num_of_lend_nft = 5;
  } else {
    // 모두 랜덤
    dao._pool_usage = 0;
    dao._num_of_own_nft = 0;
    dao._num_of_lend_nft = 0;
  }


  return (
    <Grid.Col
      span={6}
      md={6}
      lg={6}
      onClick={() => {
        router.push(`/dao/${dao.daoAddress}`);
      }}      
    >
      <CollectionWrapper
        style={{
          width: 600,
          margin: "20px auto",
          border: "1px solid rgb(229, 232, 235)",
          borderRadius: "10px",
        }}
      >
        <div>
          {dao.banner_url && (
            <CImage
              unoptimized={true}
              // src={collection.assets[0].tokenURI}
              src="/images/mypage-banner.png"
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
            backgroundColor: "blue",
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
        <div style={{ height: "300px", overflow: "hidden", padding: "0 10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "20%",
              overflow: "hidden",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            {dao.name}
          </div>
          <div>
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
          </div>
          <CTable highlightOnHover>
            <tbody>
              <tr style={{ cursor: "pointer" }}>
                <td style={{ width: "20%" }}>가입자#</td>
                <td style={{ width: "30%" }}>{dao.num_of_members} 명</td>
                <td style={{ width: "20%" }}>자금 Pool</td>
                <td style={{ width: "30%" }}>
                  <div style={{ display: "flex" }}>
                    <Image src="/images/eth.svg" width={12} height={12} alt="" />
                    <span style={{ marginLeft: "5px" }}>
                      {/* {Math.round(parseFloat(dao.members.reduce((acc, cur) => acc + cur.staking_value, 0)) * 100) / 100} */}
                      {dao.balance}
                    </span>
                  </div>
                </td>
              </tr>
              <tr style={{ cursor: "pointer" }}>
                <td>보유 NFTs</td>
                <td>{dao._num_of_own_nft} 개</td>
                <td>Pool 사용률</td>
                <td>{dao._pool_usage} %</td>
              </tr>
              <tr style={{ cursor: "pointer" }}>
                <td>대여 NFTs</td>
                <td>{dao._num_of_lend_nft} 개</td>
                <td>총 수익</td>
                <td>
                  <div style={{ display: "flex" }}>
                    <Image src="/images/eth.svg" width={12} height={12} alt="" />
                    <span style={{ marginLeft: "5px" }}>
                      {dao.rewards}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </CTable>

        </div>
      </CollectionWrapper>


    </Grid.Col>
  );
};

export default DaoCard;
