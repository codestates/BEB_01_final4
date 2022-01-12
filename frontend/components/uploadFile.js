import { create } from "ipfs-http-client";
import styled from "styled-components";
import { IconContext } from "react-icons";
import { MdOutlineImage } from "react-icons/md";

const InputTemp = styled.div`
  border-radius: 10px;
  border: 3px dashed rgb(127, 117, 117);
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  border-radius: 10px;
  height: 320px;
  // width: 350px;
  :hover {
    background-color: rgb(226, 224, 224);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 10px;
  :hover {
    background-color: transparent;
  }
`;

const PreviewImageCloseButton = styled.button`
  color: #ffffff;
  outline: none;
  border: none;
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  cursor: pointer;
  font-size: 20px;
  :hover {
    color: rgb(127, 117, 117);
  }
`;

const InputImage = styled.input`
  display: none;
`;

// const ipfsHttpClient = create("https://ipfs.infura.io:5001/api/v0");
const ipfsHttpClient = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

function UploadFile({ imageURI, setImageURI }) {
  const onHandleChange = async (event) => {
    if (event.target?.files[0]) {
      let file = event.target.files[0];

      try {
        const addedImg = await ipfsHttpClient.add(file, {
          progress: (prog) => {
            console.log(`received: ${prog}`);
          },
        });
        console.log(addedImg);
        const url = `https://ipfs.infura.io/ipfs/${addedImg.path}`;
        // const url = `https://ipfs.io/ipfs/${addedImg.path}`;
        console.log(url);
        setImageURI(url);
      } catch (e) {
        console.dir(`ipfs upload error: ${e}`);
      }
    }
  };

  return (
    <>
      <InputImage id="fileUpload" type="file" name="fileUpload" onChange={onHandleChange} />
      <label htmlFor="fileUpload">
        <InputTemp>
          <ImageContainer>
            {imageURI ? (
              <>
                <PreviewImage src={imageURI} />
                <PreviewImageCloseButton onClick={() => setImageURI("")}>X</PreviewImageCloseButton>
              </>
            ) : (
              <IconContext.Provider value={{ color: "rgb(204, 204, 204) ", outline: "none" }}>
                <div>
                  <MdOutlineImage size={70} />
                </div>
              </IconContext.Provider>
            )}
          </ImageContainer>
        </InputTemp>
      </label>
    </>
  );
}

export default UploadFile;
