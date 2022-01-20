import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

export default function Home() {
  return (
    <div>
      <Carousel
        style={{ height: "500px" }}
        emulateTouch={true}
        autoPlay={true}
        showArrows={true}
        showThumbs={false}
        width="100%"
      >
        <div>
          {/* <Image layout="fill" src="/images/carousel1.jpeg" alt="" /> */}
          <img src="/images/carousel1 (1).jpeg" alt="" />
        </div>
        <div>
          {/* <Image layout="fill" src="/images/carousel2.png" alt="" /> */}
          <img src="/images/carousel2 (1).png" alt="" />
        </div>
        <div>
          {/* <Image layout="fill" src="/images/carousel3.jpeg" alt="" /> */}
          <img src="/images/carousel3 (1).jpeg" alt="" />
        </div>
        <div>
          {/* <Image layout="fill" src="/images/carousel4.jpeg" alt="" /> */}
          <img src="/images/carousel4 (1).png" alt="" />
        </div>
      </Carousel>
    </div>
  );
}
