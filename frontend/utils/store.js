import create from "zustand";

export const useStore = create((set) => ({
  wallet: null,
  setWallet: (wallet) => set({ wallet }),

  web3: null,
  setWeb3: (web3) => set({ web3 }),

  caver: null,
  setCaver: (caver) => set({ caver }),

  networkId: null,
  setNetworkId: (networkId) => set({ networkId }),

  account: null,
  setAccount: (account) => set({ account }),

  user: null,
  setUser: (user) => set({ user }),

  collections: [],
  setCollections: (collections) => set({ collections }),
  myCollections: [],
  setMyCollections: (myCollections) => set({ myCollections }),
}));
