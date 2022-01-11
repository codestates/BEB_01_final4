import { Button, Grid, SimpleGrid, Text } from "@mantine/core";
import { useRouter } from "next/router";
import CollectionCard from "../components/collectionCard";
import { axie } from "../public/collections/axie";
import { useStore } from "../utils/store";

const Collections = () => {
  const router = useRouter();
  const collections = useStore((state) => state.collections);

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
        {collections.map((collection, i) => (
          <CollectionCard collection={collection} key={i} />
        ))}
        {/* <CollectionCard collection={axie} /> */}
      </SimpleGrid>
    </div>
  );
};

export default Collections;
