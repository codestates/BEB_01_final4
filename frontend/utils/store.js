import create from "zustand";

export const useStore = create((set) => ({
  web3: null,
  setWeb3: (web3) => set({ web3 }),

  account: null,
  setAccount: (account) => set({ account }),

  user: null,
  setUser: (user) => set({ user }),

  collections: [],
  setCollections: (collections) => set({ collections }),
  myCollections: [],
  setMyCollections: (myCollections) => set({ myCollections }),
}));
