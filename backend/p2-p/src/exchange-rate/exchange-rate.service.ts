import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  private cachedRates: Record<string, Record<string, number>> = {};
  private lastFetched: number = 0;
  private readonly CACHE_TTL_MS = 60_000; // 60 seconds

  /**
   * CoinGecko asset IDs — CoinGecko uses full names not symbols.
   * We map our symbols (BTC, ETH etc.) to their CoinGecko IDs.
   */
  private readonly COINGECKO_IDS: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDT: 'tether',
    BNB: 'binancecoin',
    SOL: 'solana',
    USD: 'usd',
    NGN: 'ngn',
  };

  private readonly VS_CURRENCIES = ['usd', 'ngn', 'btc', 'eth'];

  /**
   * CRYPTO COINS — these are the assets we fetch prices for.
   */
  private readonly CRYPTO_IDS = [
    'bitcoin',
    'ethereum',
    'tether',
    'binancecoin',
    'solana',
  ];

  async getRate(from: string, to: string): Promise<number> {
    await this.refreshIfStale();

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    // Same asset → rate is always 1
    if (fromUpper === toUpper) return 1;

    const rate = this.cachedRates[fromUpper]?.[toUpper];

    if (!rate) {
      throw new Error(`Exchange rate not available for ${from} → ${to}`);
    }

    return rate;
  }

  async getAllRates(): Promise<Record<string, Record<string, number>>> {
    await this.refreshIfStale();
    return this.cachedRates;
  }

  private async refreshIfStale(): Promise<void> {
    const now = Date.now();
    const isStale = now - this.lastFetched > this.CACHE_TTL_MS;

    if (isStale) {
      await this.fetchAndBuildRates();
    }
  }

  private async fetchAndBuildRates(): Promise<void> {
    try {
      this.logger.log('Fetching live exchange rates from CoinGecko...');

      const ids = this.CRYPTO_IDS.join(',');
      const vsCurrencies = this.VS_CURRENCIES.join(',');

      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vsCurrencies}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = (await response.json()) as Record<
        string,
        Record<string, number>
      >;

      const rates: Record<string, Record<string, number>> = {
        BTC: {},
        ETH: {},
        USD: {},
        NGN: {},
        USDT: {},
        BNB: {},
        SOL: {},
      };

      if (data.tether) {
        rates.USDT.USD = data.tether.usd;
        rates.USDT.BTC = data.tether.btc;
        rates.USDT.ETH = data.tether.eth;
        rates.USDT.NGN = data.tether.ngn;
      }

      // BNB
      if (data.binancecoin) {
        rates.BNB.USD = data.binancecoin.usd;
        rates.BNB.BTC = data.binancecoin.btc;
        rates.BNB.ETH = data.binancecoin.eth;
        rates.BNB.NGN = data.binancecoin.ngn;
      }

      // SOL
      if (data.solana) {
        rates.SOL.USD = data.solana.usd;
        rates.SOL.BTC = data.solana.btc;
        rates.SOL.ETH = data.solana.eth;
        rates.SOL.NGN = data.solana.ngn;
      }

      // Update inverse rates for USD and NGN to include new assets
      if (data.tether?.usd) rates.USD.USDT = 1 / data.tether.usd;
      if (data.binancecoin?.usd) rates.USD.BNB = 1 / data.binancecoin.usd;
      if (data.solana?.usd) rates.USD.SOL = 1 / data.solana.usd;
      if (data.tether?.ngn) rates.NGN.USDT = 1 / data.tether.ngn;
      if (data.binancecoin?.ngn) rates.NGN.BNB = 1 / data.binancecoin.ngn;
      if (data.solana?.ngn) rates.NGN.SOL = 1 / data.solana.ngn;

      // BTC rates (from CoinGecko `bitcoin` entry)
      if (data.bitcoin) {
        rates.BTC.USD = data.bitcoin.usd;
        rates.BTC.NGN = data.bitcoin.ngn;
        rates.BTC.ETH = data.bitcoin.eth;
      }

      // ETH rates (from CoinGecko `ethereum` entry)
      if (data.ethereum) {
        rates.ETH.USD = data.ethereum.usd;
        rates.ETH.NGN = data.ethereum.ngn;
        rates.ETH.BTC = data.ethereum.btc;
      }

      // USD rates — invert from crypto rates
      // If 1 BTC = 65000 USD, then 1 USD = 1/65000 BTC
      if (data.bitcoin?.usd) {
        rates.USD.BTC = 1 / data.bitcoin.usd;
        rates.USD.NGN = data.bitcoin.ngn / data.bitcoin.usd; // cross rate
      }
      if (data.ethereum?.usd) {
        rates.USD.ETH = 1 / data.ethereum.usd;
      }

      // NGN rates — invert from crypto rates
      if (data.bitcoin?.ngn) {
        rates.NGN.BTC = 1 / data.bitcoin.ngn;
        rates.NGN.USD = data.bitcoin.usd / data.bitcoin.ngn; // cross rate
      }
      if (data.ethereum?.ngn) {
        rates.NGN.ETH = 1 / data.ethereum.ngn;
      }

      this.cachedRates = rates;
      this.lastFetched = Date.now();

      this.logger.log('Exchange rates updated successfully');
      this.logger.debug(`BTC/USD: ${rates.BTC.USD}, ETH/USD: ${rates.ETH.USD}`);
    } catch (error) {
      this.logger.error('Failed to fetch exchange rates', error);

      if (Object.keys(this.cachedRates).length === 0) {
        this.logger.warn('Using fallback hardcoded rates');
        this.cachedRates = {
          BTC: {
            USD: 65000,
            NGN: 105000000,
            ETH: 18,
            USDT: 65000,
            BNB: 450,
            SOL: 1000,
          },
          ETH: {
            USD: 3500,
            NGN: 5600000,
            BTC: 0.054,
            USDT: 3500,
            BNB: 24,
            SOL: 54,
          },
          USDT: {
            USD: 1,
            NGN: 1600,
            BTC: 0.000015,
            ETH: 0.00028,
            BNB: 0.007,
            SOL: 0.007,
          },
          BNB: {
            USD: 580,
            NGN: 928000,
            BTC: 0.0089,
            ETH: 0.165,
            USDT: 580,
            SOL: 8,
          },
          SOL: {
            USD: 145,
            NGN: 232000,
            BTC: 0.0022,
            ETH: 0.041,
            USDT: 145,
            BNB: 0.25,
          },
          USD: {
            NGN: 1600,
            BTC: 0.000015,
            ETH: 0.00028,
            USDT: 1,
            BNB: 0.0017,
            SOL: 0.007,
          },
          NGN: {
            USD: 0.00063,
            BTC: 0.0000000095,
            ETH: 0.00000018,
            USDT: 0.00063,
            BNB: 0.0000011,
            SOL: 0.0000043,
          },
        };
      }
    }
  }
}
