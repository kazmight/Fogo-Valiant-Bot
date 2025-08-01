require('dotenv').config();

const axios = require('axios');
const nacl = require('tweetnacl');
const Base58 = require('base-58');


const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    console.error("Kesalahan: PRIVATE_KEY tidak ditemukan di file .env.");
    process.exit(1);
}

const config = {
    // URL API yang disimulasikan untuk mendapatkan kuotasi dan membuat transaksi
    apiUrl: "https://api.valiant.trade",
    // URL RPC yang disimulasikan untuk mengirim transaksi
    paymasterUrl: "https://sessions-example.fogo.io/paymaster",
    feePayer: "8HnaXmgFJbvvJxSdjeNyWwMXZb85E35NM4XNg6rxuw3w"
};

// Data liquidity pool yang disediakan oleh pengguna
const poolData = [
    {
        "address": "1jQiffP5sFPYvEGFVupEJLNaERBq6e7DckvBmji3Uqf",
        "poolType": "CLMM",
        "token0": { "address": "So11111111111111111111111111111111111111112", "name": "FOGO", "symbol": "FOGO", "decimals": 9, "image": "https://valiant-trade.github.io/wFOGO_big.png", "priceUsd": 6.2857199999999995 },
        "token1": { "address": "7fc38fbxd1q7gC5WqfauwdVME7ms64VGypyoHaTnLUAt", "name": "USDT", "symbol": "USDT", "decimals": 6, "image": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg", "priceUsd": 1 },
        "tvlUsd": 1181079.861476215
    },
    {
        "address": "TdzUVr42wmN71tQrMiAgSYj4gN5WgScvrJREHRodQLq",
        "poolType": "CLMM",
        "token0": { "address": "So11111111111111111111111111111111111111112", "name": "FOGO", "symbol": "FOGO", "decimals": 9, "image": "https://valiant-trade.github.io/wFOGO_big.png", "priceUsd": 6.2857199999999995 },
        "token1": { "address": "ELNbJ1RtERV2fjtuZjbTscDekWhVzkQ1LjmiPsxp5uND", "name": "USD Coin", "symbol": "USDC", "decimals": 6, "image": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png", "priceUsd": 1 },
        "tvlUsd": 14972321.751867335
    },
    {
        "address": "3icrkGov4SMod4Ps8UySRwHciNFCHvwiEn1qFJcn7dyH",
        "poolType": "CLMM",
        "token0": { "address": "So11111111111111111111111111111111111111112", "name": "FOGO", "symbol": "FOGO", "decimals": 9, "image": "https://valiant-trade.github.io/wFOGO_big.png", "priceUsd": 6.2857199999999995 },
        "token1": { "address": "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry", "name": "Fogo USD", "symbol": "fUSD", "decimals": 6, "image": "https://www.fogo.io/tokens/fusd.svg", "priceUsd": 1 },
        "tvlUsd": 1196544.6123210057
    },
    {
        "address": "8jKAA8fbhvSmUqNcRwTsCybtexoM94iAS1crk4k6w4kT",
        "poolType": "CLMM",
        "token0": { "address": "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry", "name": "Fogo USD", "symbol": "fUSD", "decimals": 6, "image": "https://www.fogo.io/tokens/fusd.svg", "priceUsd": 1 },
        "token1": { "address": "ELNbJ1RtERV2fjtuZjbTscDekWhVzkQ1LjmiPsxp5uND", "name": "USD Coin", "symbol": "USDC", "decimals": 6, "image": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png", "priceUsd": 1 },
        "tvlUsd": 1182974.750458
    },
    {
        "address": "25qJDiE9QxtVFNM1Rqmha2Vv2k2HKDoZUDtdgnfmXZsR",
        "poolType": "CLMM",
        "token0": { "address": "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry", "name": "Fogo USD", "symbol": "fUSD", "decimals": 6, "image": "https://www.fogo.io/tokens/fusd.svg", "priceUsd": 1 },
        "token1": { "address": "7fc38fbxd1q7gC5WqfauwdVME7ms64VGypyoHaTnLUAt", "name": "USDT", "symbol": "USDT", "decimals": 6, "image": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg", "priceUsd": 1 },
        "tvlUsd": 276460.304675
    },
    {
        "address": "E33Dd3ySBqrULTMMGNTU4VdZYAKQ45cE3rRcSteCbSTo",
        "poolType": "CLMM",
        "token0": { "address": "7fc38fbxd1q7gC5WqfauwdVME7ms64VGypyoHaTnLUAt", "name": "USDT", "symbol": "USDT", "decimals": 6, "image": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg", "priceUsd": 1 },
        "token1": { "address": "ELNbJ1RtERV2fjtuZjbTscDekWhVzkQ1LjmiPsxp5uND", "name": "USD Coin", "symbol": "USDC", "decimals": 6, "image": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png", "priceUsd": 1 },
        "tvlUsd": 2138488.596758
    }
];

// Fungsi untuk membuat objek wallet dari kunci privat
function createWallet(privateKey) {
    try {
        const keyPair = nacl.sign.keyPair.fromSecretKey(Base58.decode(privateKey));
        return {
            keyPair,
            publicKey: Base58.encode(keyPair.publicKey),
            address: Base58.encode(keyPair.publicKey)
        };
    } catch (e) {
        console.error("Kesalahan: Kunci privat tidak valid.");
        process.exit(1);
    }
}

// --- Kelas ApiClient untuk mempermudah permintaan HTTP ---
class ApiClient {
    constructor() {
        this.client = axios.create({
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async get(url, params = {}) {
        console.log(`[GET] Mengirim permintaan ke: ${url}`);
        // Simulasi permintaan API
        return { data: { serializedTx: "SimulatedTxDataForSigning" } };
    }

    async post(url, data = {}) {
        console.log(`[POST] Mengirim permintaan ke: ${url}`);
        // Simulasi permintaan API
        return { data: "SimulatedTxHash-" + Math.random().toString(36).substring(7) };
    }
}

// --- Kelas SwapEngine yang sudah ada ---
class SwapEngine {
    constructor(config, api) {
        this.config = config;
        this.api = api;
    }

    async executeSwap(wallet, fromToken, toToken, amount) {
        console.log(`\n--- Memulai swap: ${amount} ${fromToken.symbol} -> ${toToken.symbol} ---`);

        try {
            console.log(">> Mengambil kuotasi dari DEX...");
            const quote = { tokenMinOut: (amount * fromToken.priceUsd / toToken.priceUsd).toFixed(6), poolAddress: "SimulatedPoolAddress" };
            console.log(`   Perkiraan output: ${quote.tokenMinOut} ${toToken.symbol}`);

            console.log(">> Membuat transaksi swap...");
            const serializedTx = await this.api.get(`${this.config.apiUrl}/dex/txs/swap`);

            console.log(">> Menandatangani transaksi...");
            const signedTx = this.signTransaction(serializedTx.data.serializedTx, wallet);

            console.log(">> Mengirim transaksi ke jaringan...");
            const txHash = await this.submitTransaction(signedTx);
            console.log(`   Transaksi berhasil dikirim. Hash: ${txHash}`);

            console.log(`\n--- Swap selesai untuk ${fromToken.symbol} -> ${toToken.symbol} ---`);
            return txHash;

        } catch (error) {
            console.error(`\nKesalahan saat swap: ${error.message}`);
            if (error.response) {
                console.error("Respon API:", error.response.data);
            }
            return null;
        }
    }

    signTransaction(serializedTx, wallet) {
        const messageToSign = Buffer.from(serializedTx, 'utf-8');
        const signature = nacl.sign.detached(messageToSign, wallet.keyPair.secretKey);
        const signedTx = {
            signature: Base58.encode(signature),
            txData: serializedTx
        };
        return JSON.stringify(signedTx);
    }

    async submitTransaction(signedTx) {
        const response = await this.api.post(this.config.paymasterUrl, { transaction: signedTx });
        return response.data;
    }
}

// --- Kelas baru untuk fitur Add Liquidity Pool ---
class LiquidityEngine {
    constructor(config, api) {
        this.config = config;
        this.api = api;
    }

    async addLiquidity(wallet, pool, amountToken0, amountToken1) {
        console.log(`\n--- Menambahkan likuiditas ke pool: ${pool.token0.symbol}/${pool.token1.symbol} (${pool.address}) ---`);
        console.log(`   Jumlah: ${amountToken0} ${pool.token0.symbol} & ${amountToken1} ${pool.token1.symbol}`);

        try {
            // Langkah 1: Membuat transaksi penambahan likuiditas
            console.log(">> Membuat transaksi likuiditas...");
            const serializedTx = await this.createAddLiquidityTransaction(wallet, pool, amountToken0, amountToken1);

            // Langkah 2: Menandatangani transaksi
            console.log(">> Menandatangani transaksi...");
            const signedTx = this.signTransaction(serializedTx.data.serializedTx, wallet);

            // Langkah 3: Mengirim transaksi
            console.log(">> Mengirim transaksi ke jaringan...");
            const txHash = await this.submitTransaction(signedTx);
            console.log(`   Transaksi berhasil dikirim. Hash: ${txHash}`);

            console.log(`\n--- Penambahan likuiditas selesai ---`);
            return txHash;

        } catch (error) {
            console.error(`\nKesalahan saat menambahkan likuiditas: ${error.message}`);
            if (error.response) {
                console.error("Respon API:", error.response.data);
            }
            return null;
        }
    }

    async createAddLiquidityTransaction(wallet, pool, amountToken0, amountToken1) {
        // Simulasi permintaan API untuk membuat transaksi add liquidity
        const params = {
            poolAddress: pool.address,
            userAddress: wallet.publicKey,
            amountToken0: amountToken0,
            amountToken1: amountToken1,
            feePayer: this.config.feePayer
        };
        // Endpoint ini mungkin berbeda, ini hanya contoh simulasi
        const response = await this.api.get(`${this.config.apiUrl}/dex/txs/addLiquidity`, params);
        return response;
    }

    signTransaction(serializedTx, wallet) {
        // Logika penandatanganan sama seperti di SwapEngine
        const messageToSign = Buffer.from(serializedTx, 'utf-8');
        const signature = nacl.sign.detached(messageToSign, wallet.keyPair.secretKey);
        const signedTx = {
            signature: Base58.encode(signature),
            txData: serializedTx
        };
        return JSON.stringify(signedTx);
    }

    async submitTransaction(signedTx) {
        // Logika pengiriman transaksi sama seperti di SwapEngine
        const response = await this.api.post(this.config.paymasterUrl, { transaction: signedTx });
        return response.data;
    }
}

// --- Fungsi utama untuk menjalankan skrip ---
async function main() {
    console.log("--- Memulai FOGO Script ---");

    // Inisialisasi API client
    const apiClient = new ApiClient();

    // Buat wallet dari kunci privat yang dikonfigurasi
    const wallet = createWallet(privateKey);
    console.log(`Alamat Wallet: ${wallet.address}`);

    // --- Contoh Penggunaan SwapEngine ---
    const swapEngine = new SwapEngine(config, apiClient);
    const fromToken = poolData[0].token0; // FOGO
    const toToken = poolData[0].token1;   // USDT
    const swapAmount = 0.0001;
    await swapEngine.executeSwap(wallet, fromToken, toToken, swapAmount);

    console.log("\n-------------------------------------------");

    // --- Contoh Penggunaan LiquidityEngine ---
    const liquidityEngine = new LiquidityEngine(config, apiClient);
    const selectedPool = poolData[0]; // FOGO/USDT Pool
    const amountToken0 = 0.0005; // Jumlah FOGO yang ingin ditambahkan
    const amountToken1 = 0.003;  // Jumlah USDT yang ingin ditambahkan
    await liquidityEngine.addLiquidity(wallet, selectedPool, amountToken0, amountToken1);

}

// Panggil fungsi utama
main();
