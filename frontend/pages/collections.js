import { Text } from "@mantine/core";
import { Grid } from "@mantine/core";
import Collection from "../components/collection";
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
      <Grid justify="center">
        <Collection collection={aether} />
        <Collection collection={axie} />
        <Collection collection={clonex} />
        <Collection collection={cryptoavatars} />
        <Collection collection={decentralandNames} />
        <Collection collection={decentralandWearables} />
        <Collection collection={decentraland} />
        <Collection collection={illuvium} />
        <Collection collection={nftWorlds} />
        <Collection collection={sandbox} />
      </Grid>
    </div>
  );
};

export default Collections;
