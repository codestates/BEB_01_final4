import { SimpleGrid, Text } from "@mantine/core";
import DaoCard from "../components/DaoCard";
import { useEffect } from "react";
import axios from "axios";
import { useStore } from "../utils/store";
import { useRouter } from "next/router";

const DAOs = () => {
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
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/dao`);
      alert(collections);
      setCollections(collections);
    }
  };

  useEffect(() => {
    getCollections();
  }, [search]);

  return (
    <div>
      <Text style={{ fontSize: "38px", margin: "40px 0", fontWeight: "bold" }} align="center">
        Explore D A O
      </Text>
      <SimpleGrid
        style={{ padding: "0 30px" }}
        cols={2}
        spacing="lg"
        breakpoints={[
          { maxWidth: 1250, cols: 2, spacing: "md" },
          { maxWidth: 850, cols: 1, spacing: "sm" },
        ]}
      >
        {collections?.map((collection) => (
          <DaoCard collection={collection} key={collection.id} />
        ))}
      </SimpleGrid>
    </div>
  );
};

export default DAOs;
