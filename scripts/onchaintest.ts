import { Cell, contractAddress } from "ton-core";
import { hex } from "../build/main.compiled.json";
import { getHttpV4Endpoint } from "@orbs-network/ton-access";
import { TonClient4 } from "ton";
import qrcode from "qrcode-terminal";
import qs from "qs";

async function onchainTestScript() {
  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  const endpoint = await getHttpV4Endpoint({
    network: "testnet",
  });
  const client4 = new TonClient4({ endpoint });

  const latestBlock = await client4.getLastBlock();
  let status = await client4.getAccount(latestBlock.last.seqno, address);

  if (status.account.state.type !== "active") {
    console.log("Contract is not active");
    return;
  }

  let link =
    `https://test.tonhub.com/transfer/` +
    address.toString({ testOnly: true }) +
    "?" +
    qs.stringify({
      text: "Simple test transaction",
      amount: BigInt(0.05 * 1_000_000_000).toString(10),
    });
  qrcode.generate(link, { small: true }, (code) => {
    console.log(code);
  });
}

onchainTestScript();
