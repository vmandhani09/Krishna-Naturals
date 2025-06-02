
export const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
  const cloudFormData = new FormData();
  cloudFormData.append("file", file);
  cloudFormData.append("upload_preset", "my-preset");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: cloudFormData }
    );

    const data = await response.json();

    if (response.ok && data.secure_url) {
      return data.secure_url;
    } else {
      console.error(`Upload failed! Cloudinary Error: ${data.error?.message}`);
      return null;
    }
  } catch (error) {
    console.error("Failed to upload image:", error);
    return null;
  }
};