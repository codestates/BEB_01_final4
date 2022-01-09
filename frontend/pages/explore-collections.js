import { SimpleGrid, Text } from "@mantine/core";
import { Grid } from "@mantine/core";
import CollectionCard from "../components/collectionCard";
import { aether } from "../public/collections/aether";
import { axie } from "../public/collections/axie";
import { clonex } from "../public/collections/clonex";
import { cryptoavatars } from "../public/collections/cryptoavatars";
import { decentralandNames } from "../public/collections/decentraland-names";
import { decentralandWearables } from "../public/collections/decentraland-wearables";
import { decentraland } from "../public/collections/decentraland";
import { illuvium } from "../public/collections/illuvium";
import { nftWorlds } from "../public/collections/nft-worlds";
import { sandbox } from "../public/collections/sandbox";

const Collections = () => {
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
