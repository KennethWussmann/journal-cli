import * as fs from "fs/promises";
import { join, extname } from "path";
import * as YAML from "yaml";

export const exists = async (file: string): Promise<boolean> => {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
};

export const mkdir = async (dir: string): Promise<void> => {
  try {
    await fs.mkdir(dir);
  } catch {}
};

export const getExt = (filePath: string): string =>
  extname(filePath).substring(1);

export const findFreePath = async (
  basePath: string,
  fileName: string,
  extension: string = "md",
  addFirstIndex: boolean = false,
  index: number = 0
): Promise<string> => {
  const filePath = join(
    basePath,
    `${fileName}${
      index !== 0 || addFirstIndex ? `_${index + 1}` : ""
    }.${extension}`
  );
  if (await exists(filePath)) {
    return findFreePath(
      basePath,
      fileName,
      extension,
      addFirstIndex,
      index + 1
    );
  }
  return filePath;
};

export const splitEntry = async (
  filePath: string
): Promise<{ metadata: Record<string, any>; text: string }> => {
  const content = await fs.readFile(filePath, "utf8");

  var foundFirst = false;
  var metadataDone = false;
  const metadata: string[] = [];
  const text: string[] = [];

  content.split("\n").forEach((line, index) => {
    if (line.trim() === "---") {
      if (foundFirst) {
        metadataDone = true;
      }
      foundFirst = true;
      return;
    }
    if (metadataDone) {
      text.push(line);
    } else {
      metadata.push(line);
    }
  });
  return { metadata: YAML.parse(metadata.join("\n")), text: text.join("\n") };
};
