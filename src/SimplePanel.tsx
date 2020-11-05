import React, { useRef, useState, useEffect } from 'react';
import { PanelProps, GrafanaTheme } from '@grafana/data';
import { withTheme } from '@grafana/ui';
import { debounce } from 'lodash';
import echarts from 'echarts';
import { css, cx } from 'emotion';
import { SimpleOptions, funcParams, ClockType, ZoneFormat, ClockMode } from 'types';

// eslint-disable-next-line
import moment, { Moment } from 'moment';
import './external/moment-duration-format';

// just comment it if don't need it
import 'echarts-wordcloud';
import 'echarts-liquidfill';
import 'echarts-gl';

// auto register map
const maps = (require as any).context('./map', false, /\.json/);
maps.keys().map((m: string) => {
  const matched = m.match(/\.\/([0-9a-zA-Z_]*)\.json/);
  if (matched) {
    echarts.registerMap(matched[1], maps(m));
  } else {
    console.warn(
      "Can't register map: JSON file Should be named according to the following rules: /([0-9a-zA-Z_]*).json/."
    );
  }
});

const getStyles = () => ({
  wrapper: css`
    position: relative;
  `,
});

interface Props extends PanelProps<SimpleOptions> {
  theme: GrafanaTheme;
}

export function getTimeZoneNames(): string[] {
  return (moment as any).tz.names();
}

const PartialSimplePanel: React.FC<Props> = ({ options, data, width, height, theme }) => {
  const styles = getStyles();
  const echartRef = useRef<HTMLDivElement>(null);
  var [chart, setChart] = useState<echarts.ECharts>();
  const resetOption = debounce(
    () => {
      if (!chart) {
        return;
      }
      if (data.state && data.state !== 'Done') {
        return;
      }
      try {
        chart.clear();
        let getOption = new Function(funcParams, options.getOption);
        const o = getOption(data, theme, chart, echarts);
        o && chart.setOption(o);
      } catch (err) {
        console.error('Editor content error!', err);
      }
    },
    150,
    { leading: true }
  );

  useEffect(() => {
    if (echartRef.current) {
      chart?.clear();
      chart?.dispose();
      setChart(echarts.init(echartRef.current, options.followTheme ? theme.type : undefined));
    }

    return () => {
      chart?.clear();
      chart?.dispose();
    };
  }, [echartRef.current, options.followTheme]);

  useEffect(() => {
    chart?.resize();
  }, [width, height]);

  //************************************GRAFANA CLOCK PANEL CODE************************************************* */
  // eslint-disable-next-line
  const getTZ = (tz?: string): Moment => {
    if (!tz) {
      tz = (moment as any).tz.guess();
    }
    return (moment() as any).tz(tz);
  };
  var timerID: any;
  const [now, setNow] = useState(getTZ());

  useEffect(() => {
    timerID = setInterval(
      () => tick(),
      1000 // 1 second
    );
    return () => {
      clearInterval(timerID);
    };
  });

  const tick = () => {
    const { timezone } = options;
    setNow(getTZ(timezone));
  };

  const getTimeFormat = () => {
    const { clockType, timeSettings } = options;
    if (clockType === ClockType.Custom && timeSettings.customFormat) {
      return timeSettings.customFormat;
    }
    if (clockType === ClockType.H12) {
      return 'h:mm:ss A';
    }
    return 'HH:mm:ss';
  };

  const getCountdownText = (): string => {
    const { countdownSettings, timezone } = options;
    if (!countdownSettings.endCountdownTime) {
      return countdownSettings.endText;
    }
    const timeLeft = moment.duration(
      moment(countdownSettings.endCountdownTime)
        .utcOffset(getTZ(timezone).format('Z'), true)
        .diff(now)
    );
    let formattedTimeLeft = '';
    if (timeLeft.asSeconds() <= 0) {
      return countdownSettings.endText;
    }
    if (countdownSettings.customFormat === 'auto') {
      return (timeLeft as any).format();
    }
    if (countdownSettings.customFormat) {
      return (timeLeft as any).format(countdownSettings.customFormat);
    }
    let previous = '';
    if (timeLeft.years() > 0) {
      formattedTimeLeft = timeLeft.years() === 1 ? '1 year, ' : timeLeft.years() + ' years, ';
      previous = 'years';
    }
    if (timeLeft.months() > 0 || previous === 'years') {
      formattedTimeLeft += timeLeft.months() === 1 ? '1 month, ' : timeLeft.months() + ' months, ';
      previous = 'months';
    }
    if (timeLeft.days() > 0 || previous === 'months') {
      formattedTimeLeft += timeLeft.days() === 1 ? '1 day, ' : timeLeft.days() + ' days, ';
      previous = 'days';
    }
    if (timeLeft.hours() > 0 || previous === 'days') {
      formattedTimeLeft += timeLeft.hours() === 1 ? '1 hour, ' : timeLeft.hours() + ' hours, ';
      previous = 'hours';
    }
    if (timeLeft.minutes() > 0 || previous === 'hours') {
      formattedTimeLeft += timeLeft.minutes() === 1 ? '1 minute, ' : timeLeft.minutes() + ' minutes, ';
    }
    formattedTimeLeft += timeLeft.seconds() === 1 ? '1 second ' : timeLeft.seconds() + ' seconds';
    return formattedTimeLeft;
  };

  const renderZone = () => {
    const { timezoneSettings } = options;
    const { zoneFormat } = timezoneSettings;
    const clazz = css`
      font-size: ${timezoneSettings.fontSize};
      font-weight: ${timezoneSettings.fontWeight};
      line-height: 1.4;
    `;
    let zone = options.timezone || '';
    switch (zoneFormat) {
      case ZoneFormat.offsetAbbv:
        zone = now.format('Z z');
        break;
      case ZoneFormat.offset:
        zone = now.format('Z');
        break;
      case ZoneFormat.abbv:
        zone = now.format('z');
        break;
      default:
        try {
          zone = (getTZ(zone) as any)._z.name;
        } catch (e) {
          console.log('Error getting timezone', e);
        }
    }

    return (
      <h4 className={clazz}>
        {zone}
        {zoneFormat === ZoneFormat.nameOffset && (
          <>
            <br />({now.format('Z z')})
          </>
        )}
      </h4>
    );
  };

  const renderDate = () => {
    const { dateSettings } = options;
    const clazz = css`
      font-size: ${dateSettings.fontSize};
      font-weight: ${dateSettings.fontWeight};
    `;
    const disp = now.locale(dateSettings.locale || '').format(dateSettings.dateFormat);
    return (
      <span>
        <h3 className={clazz}>{disp}</h3>
      </span>
    );
  };

  const renderTime = () => {
    const { timeSettings, mode } = options;
    const clazz = css`
      font-size: ${timeSettings.fontSize};
      font-weight: ${timeSettings.fontWeight};
    `;
    const disp = mode === ClockMode.countdown ? getCountdownText() : now.format(getTimeFormat());
    return <h2 className={clazz}>{disp}</h2>;
  };

  const { bgColor, dateSettings, timezoneSettings } = options;
  const clazz = css`
    display: inline-flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;
    background-color: ${bgColor ?? ''};
    text-align: right;
    padding: 0px 5px 0px 0px;
    background-image: url('https://i.ibb.co/P5XNVwY/softtek-logo2.png');
    background-repeat: no-repeat;
    background-size: 20%;
    background-position: 5% 95%;
  `;

  useEffect(() => {
    if (chart) {
      var dom = chart.getDom();
      chart.getDom().style.width = '300px';
      chart.getDom().style.height = '300px';
      chart = echarts.init(dom);
      resetOption();
      let getOption = new Function(funcParams, options.getOption);
      const o = getOption(data, theme, chart, echarts);
      chart.setOption(o, true);
      var m = parseInt(now.format('mm'), 10);
      var h12 = parseInt(now.format('h'), 10) + m / 60;
      var h24 = parseInt(now.format('HH'), 10) + m / 60;
      o.series[0].data[0].value = h24;
      o.series[1].data[0].value = now.format('e');
      o.series[2].data[0].value = now.format('MM');
      o.series[3].data[0].value = now.format('DD');
      o.series[4].data[0].value = h12;
      o.series[5].data[0].value = m / 5;
      o.series[6].data[0].value = now.format('ss');
      chart?.setOption(o, true);
    }
  }, [chart, data, now]);

  return (
    <React.Fragment>
      <div
        className={clazz}
        style={{
          width,
          height,
        }}
      >
        <div
          ref={echartRef}
          className={cx(
            styles.wrapper,
            css`
              width: ${width}px;
              height: ${height}px;
            `
          )}
        ></div>
        {dateSettings.showDate && renderDate()}
        {renderTime()}
        {timezoneSettings.showTimezone && renderZone()}
      </div>
    </React.Fragment>
  );
};

export const SimplePanel = withTheme(PartialSimplePanel);
