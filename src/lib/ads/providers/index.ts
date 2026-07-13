import { MonetagProvider } from "./monetag";
import { AAdsProvider } from "./a-ads";
import { YllixProvider } from "./yllix";
import { PopAdsProvider } from "./popads";
import { HilltopAdsProvider } from "./hilltopads";
import { ClickaduProvider } from "./clickadu";
import { JuicyAdsProvider } from "./juicyads";
import { RichAdsProvider } from "./richads";
import { MediaNetProvider } from "./medianet";
import { AdRevenueProvider } from "./adrevenue";
import { EvadavProvider } from "./evadav";
import { AdsterraProvider } from "./adsterra";
import { registerProvider } from "../provider";

export function registerAllProviders(): void {
  registerProvider(new MonetagProvider());
  registerProvider(new AAdsProvider());
  registerProvider(new YllixProvider());
  registerProvider(new PopAdsProvider());
  registerProvider(new HilltopAdsProvider());
  registerProvider(new ClickaduProvider());
  registerProvider(new JuicyAdsProvider());
  registerProvider(new RichAdsProvider());
  registerProvider(new MediaNetProvider());
  registerProvider(new AdRevenueProvider());
  registerProvider(new EvadavProvider());
  registerProvider(new AdsterraProvider());
}
