import { AddressLike } from "ethers";

const Assets: { [key: string]: { id:number, name: string, address: AddressLike, holders: AddressLike[], aggregator: AddressLike } } = {
    WETH: {
        id:1,
        name: "WETH",
        address: "0x4200000000000000000000000000000000000006",
        holders: ["0xAf8d0b013379A09bbe67724Fce5B042f27F2EB60", "0x9A8f92a830A5cB89a3816e3D267CB7791c16b04D", "0xb522ed9910d47Ea1d459Dfa4a2C3B7f7F7673597"],
        aggregator: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    },
    USDT: {
        id:2,
        name: "USDT",
        address: "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda",
        holders: ["0xBAd4E930F860e593A11dd3D01ff8E11DA4243B05", "0x091a9EA5F2C1B02520B2eA52309BDd1519E94DE8", "0xAe9667AB609FA106B6F71B28490AC9E469D92a71"],
        aggregator: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D"
    },
    WBTC: {
        id:3,
        name: "WBTC",
        address: "0xCf3Ad432BC895A74D167Ec3F64eE0E6917f54Ca5",
        holders: ["0x5103BC779fdd4799Cfd5efC6ee827F7B1D57789B", "0x69D4D4600f7db2d8595827bd6FBe81888f0a06Dc"],
        aggregator: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c"
    },
    LINK: {
        id:4,
        name: "LINK",
        address: "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D",
        holders: ["0x7E9dDbE70D8582B350Ded869D2BB47897e3C86a6", "0x6AE3265ebe3e735b12770a4b7407019Af7251184", "0xfB4F8723745BF81e820FcA23E109476Abc9Fc310"],
        aggregator: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9"
    },

    USDC: {
        id:5,
        name: "USDC",
        address: "0x34b422de20051bDf8fcA23664C8265e70c0FCb21",
        holders: ["0x32e23c6ee71d759f65E531aF513D6C938c15C1E4", "0xC8CBefeC99D582351a0aeF7fA22B417484C6fd05"],
        aggregator: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6"
    }
};

export const EthHolders = [
    "0x0a4c79cE84202b03e95B7a692E5D728d83C44c76",
    "0x7d6149aD9A573A6E2Ca6eBf7D4897c1B766841B4",
    "0x4Ed97d6470f5121a8E02498eA37A50987DA0eEC0",
    "0x7f1502605A2f2Cc01f9f4E7dd55e549954A8cD0C",
    "0x4eac9CE57Af61A6fB1f61f0BF1D8586412bE30Bc"
];


export const SepolinaAssets: { [key: string]: { id:number, name: string, address: AddressLike, holders: AddressLike[], aggregator: AddressLike } } = {
    
    USDT: {
        id:1,
        name: "USDT",
        address: "0xb47Eda1D52C6c09dCa6F83Acd7E3eCA576f000dC",
        holders: [],
        aggregator: "0x3ec8593F930EA45ea58c968260e6e9FF53FC934f"
    },
    BTC: {
        id:2,
        name: "BTC",
        address: "0x94FA6257c3B182D71f88B85294B5C771451B7a69",
        holders: [],
        aggregator: "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298"
    },
    ETH: {
        id:3,
        name: "ETH",
        address: "0x870954612eb55232423760593eE3A1d283aC7B93",
        holders: [],
        aggregator: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"
    },
    LINK: {
        id:4,
        name: "LINK",
        address: "0x98F3bc937aB52d5B54BF4eBD7BaB8746eC14A159",
        holders: [],
        aggregator: "0xb113F5A928BCfF189C998ab20d753a47F9dE5A61"
    },
    USDC: {
        id:5,
        name: "USDC",
        address: "0x46Be9CcF941a8dEb257d7F29c72e06871139Fc7e",
        holders: [],
        aggregator: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165"
    },
};




export default Assets;