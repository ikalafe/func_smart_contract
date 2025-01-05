import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
} from "ton-core";

export type MainContractConfig = {
  number: number;
  address: Address;
  owner_addr: Address;
};

export function mainContractConfigCell(config: MainContractConfig): Cell {
  return beginCell()
    .storeUint(config.number, 32)
    .storeAddress(config.address)
    .storeAddress(config.owner_addr)
    .endCell();
}

export class MainContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromConfig(
    config: MainContractConfig,
    code: Cell,
    workchain = 0
  ) {
    const data = mainContractConfigCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);

    return new MainContract(address, init);
  }

  async sendIncrementComment(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    inc_by: number
  ) {
    const msg_body = beginCell()
      .storeUint(1, 32)
      .storeUint(inc_by, 32)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
    const msg_body = beginCell().storeUint(2, 32).endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async sendNoCodeDeposit(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    const msg_body = beginCell().endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async sendWithdrawalReq(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    amount: bigint
  ) {
    const msg_body = beginCell()
      .storeUint(3, 32) // OP Code
      .storeCoins(amount)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async getData(provider: ContractProvider) {
    const { stack } = await provider.get("get_contract_storage", []);

    return {
      number: stack.readNumber(),
      recent_sender: stack.readAddress(),
      owner_addr: stack.readAddress(),
    };
  }

  async getCurrentBalance(provider: ContractProvider) {
    const { stack } = await provider.get("current_balance", []);
    return {
      balance: stack.readNumber(),
    };
  }
}
