import { Button, Input, SimpleGrid, Text } from "@mantine/core";
import styled from "styled-components";
import { BiDollar } from "react-icons/bi";
import { MdOutlineWatchLater, MdOutlineInfo } from "react-icons/md";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";
import axios from "axios";
import { GGanbuCollection } from "../../../../public/compiledContracts/GGanbuCollection";
import { GGanbuCollectionForKlaytn } from "../../../../public/compiledContracts/GGanbuCollectionForKlaytn";
import { useStore } from "../../../../utils/store";
import { useRouter } from "next/router";
import { useEffect } from "react/cjs/react.development";
import { useInputState } from "@mantine/hooks";
import { useState } from "react";

const TitleText = styled(Text)`
  font-size: 26px;
  font-weight: bold;
`;

const Container = styled.div`
  margin: 30px auto;
  max-width: 1080px;

  && .mantine-Text-root {
    font-size: 22px;
  }
`;

const TypeWrapper = styled.div`
  display: flex;
  border: 1px solid rgb(229, 232, 235);
  border-radius: 10px;
`;

const TypeItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 108px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
`;

const PriceWrapper = styled.div`
  display: flex;
`;

const CInput = styled(Input)`
  && input {
    height: 52.8px;
    font-size: 20px;
  }
  margin-left: 25px;
`;

const Lend = () => {
  const [web3, account] = useStore((state) => [state.web3, state.account]);
  const [lendPrice, setLendPrice] = useInputState("");
  // const [nft, setNft] = useState(null);
  const router = useRouter();
  const { symbol, tokenId } = router.query;
  const [contract, setContract] = useState(null);
  const [caver, networkId] = useStore((state) => [state.caver, state.networkId]);

  const checkIsMyNft = async () => {
    if (symbol && tokenId && account) {
      console.log(symbol, tokenId);
      const {
        data: { data: nftData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/assets/${symbol}/${tokenId}`, {
        withCredentials: true,
      });

      let nftOwner;
      if (web3 || caver) {
        if (networkId === 1001 || networkId === 8217) {
          const contract = await new caver.klay.Contract(GGanbuCollectionForKlaytn.abi, nftData?.contractAddress, {
            from: account,
          });
          setContract(contract);
          nftOwner = await contract.methods.ownerOf(tokenId).call();
        } else {
          const contract = await new web3.eth.Contract(GGanbuCollection.abi, nftData?.contractAddress, {
            from: account,
          });
          setContract(contract);
          nftOwner = await contract.methods.ownerOf(tokenId).call();
        }
        if (nftOwner === account) {
          return;
        }
      }
    }

    // setNft(nftData);

    // console.log(nftData);

    alert("NFT 소유자가 아닙니다.");
    router.push("/");
  };

  useEffect(() => {
    checkIsMyNft();
  }, [account]);

  const handleClickRent = async () => {
    try {
      let txResult;
      let isKlaytn = networkId === 1001 || networkId === 8217;
      if (isKlaytn) {
        const unitPrice = caver.utils.toPeb(lendPrice, "KLAY");
        txResult = await contract.methods.rent(tokenId, unitPrice).send({ from: account, gas: 9000000 });
      } else {
        const unitPrice = web3.utils.toWei(lendPrice, "ether");
        txResult = await contract.methods.rent(tokenId, unitPrice).send();
      }

      console.log(txResult);
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/transaction`,
        {
          transaction: txResult.transactionHash,
          networkType: isKlaytn ? "klaytn" : "ethereum",
        },
        {
          withCredentials: true,
        },
      );

      let event = await contract.getPastEvents("_rental", {
        fromBlock: txResult.blockNumber,
        toBlock: txResult.blockNumber,
      });
      // console.log(event);

      let log = event.find((log) => log.transactionHash == txResult.transactionHash);
      // console.log(log);
      console.log(log.returnValues);

      router.push(`/assets/${symbol}/${tokenId}`);
    } catch (e) {
      console.dir(e);
    }
  };

  return (
    <Container>
      <SimpleGrid cols={2} style={{ gap: "200px" }}>
        <div>
          <TitleText style={{ fontSize: "28px" }}>List item for lending</TitleText>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "30px 0 10px 0" }}>
            <Text style={{ fontWeight: "bold" }}>Type</Text>
            <MdOutlineInfo style={{ fontSize: "26px" }} />
          </div>
          <TypeWrapper>
            <TypeItem style={{ borderRight: "1px solid rgb(229, 232, 235)", backgroundColor: "rgb(243, 251, 254)" }}>
              <BiDollar style={{ fontSize: "26px" }} />
              <Text style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}>Fixed Price</Text>
            </TypeItem>
            <TypeItem style={{ cursor: "not-allowed", color: "rgb(229, 232, 235)" }}>
              <MdOutlineWatchLater style={{ fontSize: "26px" }} />
              <Text style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px", color: "rgb(229, 232, 235)" }}>
                Timed Auction
              </Text>
            </TypeItem>
          </TypeWrapper>

          <div style={{ display: "flex", justifyContent: "space-between", margin: "30px 0 10px 0" }}>
            <Text style={{ fontWeight: "bold" }}>Price</Text>
            <MdOutlineInfo style={{ fontSize: "26px" }} />
          </div>
          <PriceWrapper>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "16px",
                padding: "13px",
                border: "1px solid rgb(229, 232, 235)",
                borderRadius: "10px",
                backgroundColor: "rgba(229, 232, 235, 0.25)",
                flex: "40%",
              }}
            >
              <Image
                src={`${networkId === 1001 || networkId === 8217 ? "/images/klay.svg" : "/images/eth.svg"}`}
                width={24}
                height={24}
                alt=""
              />
              <div style={{ margin: "0 25px", fontSize: "20px" }}>{`${
                networkId === 1001 || networkId === 8217 ? "KLAY" : "ETH"
              }`}</div>
              <IoIosArrowDown />
            </div>
            <div style={{ display: "flex", alignItems: "center", flex: "60%" }}>
              <CInput value={lendPrice} onChange={setLendPrice} variant="default" placeholder="Amount" />
            </div>
          </PriceWrapper>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "30px 0 5px 0" }}>
              <Text style={{ fontWeight: "bold" }}>Fees</Text>
              <MdOutlineInfo style={{ fontSize: "26px" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "bold", color: "rgb(112, 122, 131)" }}>Service Fee</Text>
              <Text style={{ fontWeight: "bold", color: "rgb(112, 122, 131)" }}>10%</Text>
            </div>
          </div>
          <Button onClick={handleClickRent} size="lg" style={{ marginTop: "30px" }} color="teal">
            Complete Listing
          </Button>
        </div>
        <div>
          <TitleText>Preview</TitleText>
        </div>
      </SimpleGrid>
    </Container>
  );
};

export default Lend;
