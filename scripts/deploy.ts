import {
  beginCell,
  Cell,
  contractAddress,
  StateInit,
  storeStateInit,
  toNano,
} from "ton-core";
import { hex } from "../build/main.compiled.json";
import qs from "qs";
import qrcode from "qrcode-terminal";

import dotenv from "dotenv";
dotenv.config();

async function deployScript() {
  console.log(
    "================================================================="
  );
  console.log("Deploy Server is Running, let's deploy our main.fc contract...");

  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const stateInit: StateInit = {
    code: codeCell,
    data: dataCell,
  };

  const stateInitBuilder = beginCell();
  storeStateInit(stateInit)(stateInitBuilder);
  const stateInitCell = stateInitBuilder.endCell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  console.log(
    `The address of the contract is following: ${address.toString()}`
  );
  console.log(`Please Scan the QRCode below to to deploy the contract to ${process.env.TESTNET ? "testnet" : "mainnet"}:`);

  let link =
    `https://${process.env.TESTNET ? "test." : ""}tonhub.com/transfer/` +
    address.toString({
      testOnly: process.env.TESTNET ? true : false,
    }) +
    "?" +
    qs.stringify({
      text: "Deploy contract",
      amount: BigInt(0.0001 * 1_000_000_000).toString(10),
      init: stateInitCell.toBoc({ idx: false }).toString("base64"),
    });
  qrcode.generate(link, { small: true }, (code) => {
    console.log(code);
  });
}

deployScript();
