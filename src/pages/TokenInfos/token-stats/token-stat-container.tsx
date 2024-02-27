import CurrencyLogo from 'components/CurrencyLogo';
import Row, { RowBetween } from 'components/Row';
import { TokenModel } from 'models/TokenModel';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TYPE } from 'theme';
import { useDefaultTokens } from 'hooks/Tokens';
import { TokenInfosCard } from '../token-infos-card';
import TokenStat from './token-stat';
import Column from 'components/Column';
import { PairModel } from 'models/PairModel';
import { formatNumber } from 'utils/formatNumber';
import { Chart } from 'react-google-charts';
import TokenVolumeChart from './charts/token-volume-chart/token-volume-chart';
import TokenPriceChart from './charts/token-price-chart/token-price-chart';
import TokenTVLChart from './charts/token-tvl-chart/token-tvl-chart';
import { register } from 'swiper/element/bundle';

register();
const TokenStatsContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  column-gap: 1.5em;
  width: 100%;
`;

const ChartContainer = styled(TokenInfosCard)`
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`;

const ChartWrapper = styled.div`
  padding: 5px 1em;
  width: 100%;
  flex: 1;
`;

const TokenChartTabContainer = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.bg2};
`;
// add active state to the tab
const TokenChartTab = styled.div<{ active?: boolean }>`
  flex: 1;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme, active }) => (active ? theme.bg1 : theme.bg2)};
  padding: 1em;
  text-align: center;
  transition: background-color 0.4s;
  border-radius: 2rem 2rem 0 0;
`;

export default function TokenStatContainer({ token }: { token: TokenModel }) {
  const [pairs, setPairs] = useState<PairModel[]>([]);
  const fetchInfo = () => {
    return fetch('http://162.0.211.141:4000/api/pairs/tokens/' + token.address)
      .then((res) => res.json())
      .then((d) => setPairs(d));
  };
  useEffect(() => {
    fetchInfo();
  }, []);
  const volume24h = token.volume
    .filter((tokenVolume) => {
      return new Date(tokenVolume.date).getTime() > new Date().getTime() - 24 * 60 * 60 * 1000;
    })
    .reduce((acc, volume) => {
      return acc + Number(volume.usdVolume);
    }, 0);

  const volume7d = pairs.reduce((acc, pair) => {
    const volume = Number(
      pair.idToken0 === token.id
        ? pair.volume.reduce((acc, volume) => acc + Number(volume.token0UsdVolume), 0)
        : pair.volume.reduce((acc, volume) => acc + Number(volume.token1UsdVolume), 0)
    );
    return acc + volume;
  }, 0);
  const [activeTab, setActiveTab] = useState(1);
  return (
    <TokenStatsContainer>
      <TokenInfosCard>
        <Column style={{ gap: '1.5em' }}>
          <swiper-container slides-per-view="3" navigation="true" pagination="true">
            <swiper-slide>
              <TokenStat
                title="TVL"
                value={`$${formatNumber(token.lastTvl?.reserveUsd)}`}
                percentChange={0.25}
              ></TokenStat>
              <TokenStat title="Volume 24H" value={`$${formatNumber(volume24h)}`} percentChange={-25}></TokenStat>
              <TokenStat title="Volume 7D" value={`$${formatNumber(volume7d)}`}></TokenStat>
              <TokenStat title="Transactions 24H" value="135.40K"></TokenStat>
            </swiper-slide>
            <swiper-slide>Slide 2</swiper-slide>
            <swiper-slide>Slide 3</swiper-slide>
          </swiper-container>
        </Column>
      </TokenInfosCard>
      <ChartContainer>
        <TokenChartTabContainer>
          <TokenChartTab active={activeTab === 0} onClick={() => setActiveTab(0)}>
            <TYPE.black fontWeight={540} fontSize={16}>
              Volume
            </TYPE.black>
          </TokenChartTab>
          <TokenChartTab active={activeTab === 1} onClick={() => setActiveTab(1)}>
            <TYPE.black fontWeight={540} fontSize={16}>
              TVL
            </TYPE.black>
          </TokenChartTab>
          <TokenChartTab active={activeTab === 2} onClick={() => setActiveTab(2)}>
            <TYPE.black fontWeight={540} fontSize={16}>
              Price
            </TYPE.black>
          </TokenChartTab>
        </TokenChartTabContainer>
        <ChartWrapper>
          {activeTab === 0 && <TokenVolumeChart token={token}></TokenVolumeChart>}
          {activeTab === 1 && <TokenTVLChart token={token}></TokenTVLChart>}
          {activeTab === 2 && <TokenPriceChart token={token}></TokenPriceChart>}
        </ChartWrapper>
      </ChartContainer>
    </TokenStatsContainer>
  );
}