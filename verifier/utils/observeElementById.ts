const observeElementById = async (
  id: string,
  timeout: number = Infinity
): Promise<HTMLElement> => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      const element = document.getElementById(id);
      if (element) {
        clearInterval(intervalId);
        resolve(element);
      } else if (Date.now() - startTime >= timeout * 1000) {
        clearInterval(intervalId);
        reject(new Error("Element not found"));
      }
    }, 100);
  });
};

export default observeElementById;
