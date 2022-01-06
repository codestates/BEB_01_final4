import Image from "next/image";

const Slide = ({ id, image, title }) => {
  return (
    <>
      <Image alt={title} layout="fill" objectFit="contain" loading="lazy" src={image} />
    </>
  );
};

export default Slide;
