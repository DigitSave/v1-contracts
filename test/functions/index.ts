import hre from "hardhat";
import { BigNumberish } from "ethers";
import {Token } from "../../typechain-types";


export const weiToToken = (bigNumber: BigNumberish|BigInt, decimal: number = 18) : string => {
    return parseFloat(hre.ethers.formatUnits(bigNumber.toString(), decimal)).toFixed(4);
};

export const tokenToWei = (num: number, decimal: number = 18) => {
    return hre.ethers.parseUnits(num.toString(), decimal);
};

export  const getEthBalance = async (address:string): Promise<string> =>{
    const balance = await hre.ethers.provider.getBalance(address);
    return weiToToken(balance);
}

export  const getTokenBalanceForUser = async (tokenAddress:string,userAddress:string): Promise<bigint> =>{
    const Token = await hre.ethers.getContractFactory("Token");
    const tokenInstance =  Token.attach(tokenAddress) as Token;
    const balance = (await tokenInstance.balanceOf(userAddress));
    return (balance);
}


export const bigIntToNumber = (bigNumber: BigNumberish|BigInt) : number => {
    return parseFloat(bigNumber.toString())
};