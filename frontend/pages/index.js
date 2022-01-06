import ReactDOM from "react-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import Slide from "../components/slide";

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
        {/* <Slide key="0" image="https://venturebeat.com/wp-content/uploads/2021/03/article23-1.jpg?w=1200&strip=all" />
        <Slide key="1" image="https://images.newindianexpress.com/uploads/user/imagelibrary/2021/11/27/w1200X800/Metaverse_is_Coming.jpg" />
        <Slide key="2" image="/images/carousel3.jpeg" />
        <Slide key="3" image="/images/carousel4.jpeg" /> */}

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
