import { Button, Grid, Text } from "@mantine/core";
import { useRouter } from "next/router";
import Collection from "../components/collection";
import { axie } from "../public/collections/axie";

const Collections = () => {
  const router = useRouter();

  return (
    <div>
      <Text style={{ fontSize: "48px", fontWeight: "bold" }}>My Collections</Text>
      <Text style={{ margin: "20px 0" }}>Create, curate, and manage collections of unique NFTs to share and sell.</Text>
      <Button style={{ marginBottom: "20px" }} color="teal" size="xl" onClick={() => router.push("/create-collection")}>
        Create a collection
      </Button>
      <Grid justify="center">
        <Collection collection={axie} />
      </Grid>
    </div>
  );
};

export default Collections;
