import { Button, SimpleGrid, Text } from "@mantine/core";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CollectionCard from "../components/collectionCard";
import { useStore } from "../utils/store";

const Collections = () => {
  const router = useRouter();
  const [myCollections, setMyCollections] = useStore((state) => [state.myCollections, state.setMyCollections]);
  const account = useStore((state) => state.account);

  const getMyCollections = async () => {
    try {
      const {
        data: { data: myCollectionsData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}/collections`);
      if (myCollectionsData) {
        console.log(myCollectionsData);
        setMyCollections(myCollectionsData);
      }
    } catch (e) {
      console.log(e.response);
    }
  };

  useEffect(() => {
    getMyCollections();
    if (!account) {
      alert("지갑을 연결해주세요.");
    }
  }, [account]);

  return (
    <div>
      <Text style={{ fontSize: "48px", fontWeight: "bold" }}>My Collections</Text>
      <Text style={{ margin: "20px 0" }}>Create, curate, and manage collections of unique NFTs to share and sell.</Text>
      <Button style={{ marginBottom: "20px" }} color="teal" size="xl" onClick={() => router.push("/create-collection")}>
        Create a collection
      </Button>

      <SimpleGrid
        style={{ padding: "0 30px" }}
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 1250, cols: 2, spacing: "md" },
          { maxWidth: 850, cols: 1, spacing: "sm" },
        ]}
      >
        {myCollections.map((collection, i) => (
          <CollectionCard collection={collection} key={i} />
        ))}
        {/* <CollectionCard collection={axie} /> */}
      </SimpleGrid>
    </div>
  );
};

export default Collections;
