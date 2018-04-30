import { BaseContract } from "./base_contract";
import { DetailedERC20Contract as ERC20Contract } from "./DetailedERC20_wrapper";
import { SetTokenContract } from "./SetToken_wrapper";

export type ContractWrapper =
    | ERC20Contract
    | SetTokenContract;

export {
    BaseContract,
    ERC20Contract,
    SetTokenContract,
};
