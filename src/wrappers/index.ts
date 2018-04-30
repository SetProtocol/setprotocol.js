import { DebtOrderWrapper } from "./debt_order_wrapper";
import { BaseContract } from "./base_contract";
import { DetailedERC20Contract as ERC20 } from "./DetailedERC20_wrapper";
import { SetTokenContract } from "./SetToken_wrapper";

export type ContractWrapper =
    | ERC20
    | SetTokenContract;

export {
    BaseContract,
    ERC20,
    SetTokenContract,
};
