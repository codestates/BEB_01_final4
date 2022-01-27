export const compressAddress = (address) => {
  if (address) {
    return address.slice(0, 4) + "..." + address.slice(-4);
  } else {
    return null;
  }
};
