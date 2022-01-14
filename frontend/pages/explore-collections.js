import { SimpleGrid, Text } from "@mantine/core";
import CollectionCard from "../components/collectionCard";
import { useEffect } from "react";
import axios from "axios";
import { useStore } from "../utils/store";
import { useRouter } from "next/router";

const Collections = () => {
  const [collections, setCollections] = useStore((state) => [state.collections, state.setCollections]);
  const router = useRouter();
  const { search } = router.query;

  const getCollections = async () => {
    if (search) {
      const {
        data: { data: collections },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/collections?search=${search}`);
      setCollections(collections);
    } else {
      const {
        data: { data: collections },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/collections`);
      setCollections(collections);
    }
  };

  useEffect(() => {
    getCollections();
  }, [search]);

  return (
    <div>
      <Text style={{ fontSize: "32px", margin: "40px 0", fontWeight: "bold" }} align="center">
        Explore Collections
      </Text>
      <SimpleGrid
        style={{ padding: "0 30px" }}
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 1250, cols: 2, spacing: "md" },
          { maxWidth: 850, cols: 1, spacing: "sm" },
        ]}
      >
        {collections?.map((collection) => (
          <CollectionCard collection={collection} key={collection.id} />
        ))}
        {/* <CollectionCard collection={aether} />
        <CollectionCard collection={axie} />
        <CollectionCard collection={clonex} />
        <CollectionCard collection={cryptoavatars} />
        <CollectionCard collection={decentralandNames} />
        <CollectionCard collection={decentralandWearables} />
        <CollectionCard collection={decentraland} />
        <CollectionCard collection={illuvium} />
        <CollectionCard collection={nftWorlds} />
        <CollectionCard collection={sandbox} /> */}
      </SimpleGrid>

      {/* <Grid justify="space-between" style={{ padding: "0px 40px" }}>
        <CollectionCard collection={aether} />
        <CollectionCard collection={axie} />
        <CollectionCard collection={clonex} />
        <CollectionCard collection={cryptoavatars} />
        <CollectionCard collection={decentralandNames} />
        <CollectionCard collection={decentralandWearables} />
        <CollectionCard collection={decentraland} />
        <CollectionCard collection={illuvium} />
        <CollectionCard collection={nftWorlds} />
        <CollectionCard collection={sandbox} />
      </Grid> */}
    </div>
  );
};

export default Collections;
