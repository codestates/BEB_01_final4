import axios from "axios";
import { useEffect, useState } from "react";
import { useStore } from "../../../utils/store";
import GGanbuBoard from "../../gganbuBoard";

const MyGGanbu = ({ activeSubTab }) => {
  const [myGGanbuList, setMyGGanbuList] = useState([]);
  const account = useStore((state) => state.account);

  const getMyGGanbuList = async () => {
    const {
      data: { data: myGGanbuList },
    } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/gganbu?user=${account}`, {
      withCredentials: true,
    });

    setMyGGanbuList(myGGanbuList);
  };

  useEffect(() => {
    getMyGGanbuList();
  }, [account, activeSubTab]);

  return (
    <div>
      <GGanbuBoard gganbuList={myGGanbuList} />
    </div>
  );
};

export default MyGGanbu;
