import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  const exName = path.extname(file.originalname).toString();
  return parser.format(exName, file.buffer).content;
};
export default getDataUri;