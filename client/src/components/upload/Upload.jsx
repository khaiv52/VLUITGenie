import { IKContext, IKUpload } from "imagekitio-react";
import React, { useRef } from "react";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;

const authenticator = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/upload");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Requeset failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

function Upload({
  setImg,
  isConnected,
  client,
  setShouldSendToServer,
  setIsTyping,
}) {
  const ikUploadRef = useRef(null);
  const onError = (err) => {
    console.log("Error", err);
  };

  const onSuccess = async (res) => {
    console.log("Success", res);
    setImg((prev) => ({ ...prev, isLoading: false, dbData: res }));

    // setMessages((prevMessages) => [
    //   ...prevMessages,
    //   {
    //     payload: { block: { fileData: res.filePath } },
    //     authorId: "user",
    //   },
    // ]);

    // Trigger mutation sau khi upload ảnh thành công
    setShouldSendToServer(true);
  };

  const onUploadProgress = (progress) => {
    console.log("Progress", progress);
  };

  const onUploadStart = async (evt) => {
    const file = evt.target.files[0]; // Lấy file mà người dùng tải lên

    if (file) {
      try {
        const response = await client.sendFile(file);
        setIsTyping(true);

        if (response && response.fileUrl) {
          console.log("File sent successfully:", response);
        } else {
          console.error("No URL received from response: ", response);
        }
      } catch (error) {
        console.error("Error sending file:", error);
      }
    }
    console.log("Start", evt);
  };

  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        fileName="test-upload.png"
        onError={onError}
        onSuccess={onSuccess}
        useUniqueFileName={true}
        onUploadProgress={onUploadProgress}
        onUploadStart={onUploadStart}
        style={{ display: "none" }}
        ref={ikUploadRef}
      />

      <label
        onClick={() => ikUploadRef.current.click()}
        aria-disabled={!isConnected}
        style={isConnected ? {} : { background: "rgba(117, 117, 117, 0.4)" }}
      >
        <img src="/attachment.png" alt="" />
      </label>
    </IKContext>
  );
}

export default Upload;
