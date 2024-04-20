const credValidator = (key1: string, key2: string, callback: any) => {
  try {
    let isValid: boolean;
    if (key1 && key2) isValid = key1 === key2 ? true : false;
    else throw new Error("Please provide two keys.");

    if (typeof callback !== "function")
      throw new Error("No callback function.");

    return isValid === true ? callback() : "Keys do not match.";
  } catch (error) {
    throw new Error("Validator parameter error.\n" + error);
  }
};

export = { credValidator };