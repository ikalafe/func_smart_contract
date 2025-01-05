import { Cell, toNano } from "ton-core";
import { hex } from "../build/main.compiled.json";
import {
  Blockchain,
  SandboxContract,
  TreasuryContract,
} from "@ton-community/sandbox";
import { MainContract } from "../wrappers/MainContract";
import "@ton-community/test-utils";

describe("main.fc contract tests", () => {
  let blockchain: Blockchain;
  let myContract: SandboxContract<MainContract>;
  let initWalletAddress: SandboxContract<TreasuryContract>;
  let ownerWalletAddress: SandboxContract<TreasuryContract>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    initWalletAddress = await blockchain.treasury("initWalletAddress");
    ownerWalletAddress = await blockchain.treasury("ownerWalletAddress");

    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

    myContract = blockchain.openContract(
      await MainContract.createFromConfig(
        {
          number: 0,
          address: initWalletAddress.address,
          owner_addr: ownerWalletAddress.address,
        },
        codeCell
      )
    );
  });

  it("should successfully increase counter in contract and get the proper most recent sender addr", async () => {
    const senderWallet = await blockchain.treasury("sender");

    const sentMessageResult = await myContract.sendIncrementComment(
      senderWallet.getSender(),
      toNano("0.05"),
      1
    );

    expect(sentMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const data = await myContract.getData();

    expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
    expect(data.number).toEqual;
  });
});
