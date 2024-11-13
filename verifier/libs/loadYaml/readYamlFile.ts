import fs from "fs";
import yaml from "js-yaml";
import { ObjectType } from "./types";

const readYamlFile = (filePath: string) => {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContents) as ObjectType;
  } catch (e) {
    console.error("Error reading YAML file:", e);
    return null;
  }
};

export default readYamlFile;
