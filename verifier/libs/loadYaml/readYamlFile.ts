import fs from "fs";
import yaml from "js-yaml";

const readYamlFile = <T>(filePath: string) => {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContents) as T;
  } catch (e) {
    console.error("Error reading YAML file:", e);
    return {} as T;
  }
};

export default readYamlFile;
