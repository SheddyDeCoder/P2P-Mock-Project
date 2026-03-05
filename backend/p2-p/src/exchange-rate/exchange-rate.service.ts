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
    USD: 'usd', // USD is a vs_currency, not a coin — handled separately
    NGN: 'ngn', // NGN is also a vs_currency
  };

  private readonly VS_CURRENCIES = ['usd', 'ngn', 'btc', 'eth'];

  /**
   * CRYPTO COINS — these are the assets we fetch prices for.
   */
  private readonly CRYPTO_IDS = ['bitcoin', 'ethereum'];

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
      };

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
          BTC: { USD: 65000, NGN: 105000000, ETH: 18 },
          ETH: { USD: 3500, NGN: 5600000, BTC: 0.054 },
          USD: { NGN: 1600, BTC: 0.000015, ETH: 0.00028 },
          NGN: { USD: 0.00063, BTC: 0.0000000095, ETH: 0.00000018 },
        };
      }
    }
  }
}
