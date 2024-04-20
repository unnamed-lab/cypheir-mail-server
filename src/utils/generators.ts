const { createHmac } = require("crypto");
const { hmac, salt } = require("./hash");

type THTOPOption = {
  type: "numeric" | "alphanumeric";
  offset?: number;
};

type TCodeFuse = {
  value: string;
  key: string | number;
  client: string;
};

const HOTP = (
  key: string,
  digits: number = 6,
  option: THTOPOption = {
    type: "numeric",
    offset: 0,
  }
): string => {
  if (digits <= 12) {
    const { type, offset } = option;
    const valueOffset = offset ? offset : 0;
    const rand = Math.floor(Math.random() * (20 + valueOffset) + 1);

    const secretKey = Buffer.from(key);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(rand ** 5), 0);
    const hmacDigest = hmac(secretKey, counterBuffer);

    const displacement = hmacDigest[hmacDigest.length - 1] & 0x0f;
    const binaryCode = hmacDigest.slice(displacement, displacement + 4);
    const dynamicValue = binaryCode.readUInt32BE() & 0x7fffffff;

    if (type === "numeric") {
      const otp = dynamicValue % 10 ** digits;
      return otp.toString().padStart(digits, "0");
    }

    const largeDynamicValue = BigInt(dynamicValue ** rand);
    const base36OTP = BigInt(largeDynamicValue).toString(36).toLowerCase();

    return base36OTP.slice(rand, digits + rand);
  }

  throw new Error("The digit input is greate than the maximum (12).");
};

const FuseHash = (option: TCodeFuse): string => {
  const { value, key, client } = option;
  const combo: string = `${key}:${value}:${client}`;
  return salt(combo, key, 32);
};

export = { HOTP, FuseHash };
