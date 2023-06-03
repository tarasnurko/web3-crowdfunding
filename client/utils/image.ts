export const checkImageExists = async (imageUrl: string) => {
  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = imageUrl;
    });
    return true;
  } catch (error) {
    return false;
  }
};
