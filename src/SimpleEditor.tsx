import React from 'react';
import { PanelOptionsEditorBuilder, GrafanaTheme, dateTime } from '@grafana/data';
import { ColorPicker, Input, Icon, stylesFactory } from '@grafana/ui';
import { css } from 'emotion';
import { config } from '@grafana/runtime';

import { SimpleOptions, ClockMode, ClockType, FontWeight, ZoneFormat } from './types';
import { getTimeZoneNames } from './SimplePanel';

export const optionsBuilder = (builder: PanelOptionsEditorBuilder<SimpleOptions>) => {
  // Global options
  builder
    .addRadio({
      path: 'mode',
      name: 'Mode',
      settings: {
        options: [
          { value: ClockMode.time, label: 'Time' },
          { value: ClockMode.countdown, label: 'Countdown' },
        ],
      },
      defaultValue: ClockMode.time,
    })
    .addCustomEditor({
      id: 'bgColor',
      path: 'bgColor',
      name: 'Background Color',
      editor: props => {
        const styles = getStyles(config.theme);
        let prefix: React.ReactNode = null;
        let suffix: React.ReactNode = null;
        if (props.value) {
          suffix = <Icon className={styles.trashIcon} name="trash-alt" onClick={() => props.onChange(undefined)} />;
        }

        prefix = (
          <div className={styles.inputPrefix}>
            <div className={styles.colorPicker}>
              <ColorPicker
                color={props.value || config.theme.colors.panelBg}
                onChange={props.onChange}
                enableNamedColors={true}
              />
            </div>
          </div>
        );

        return (
          <div>
            <Input
              type="text"
              value={props.value || 'Pick Color'}
              onBlur={(v: any) => {
                console.log('CLICK');
              }}
              prefix={prefix}
              suffix={suffix}
            />
          </div>
        );
      },
      defaultValue: '',
    });
  // TODO: refreshSettings.syncWithDashboard

  addCountdown(builder);
  addTimeFormat(builder);
  addTimeZone(builder);
  addDateFormat(builder);
  addEcharts(builder);
};

//---------------------------------------------------------------------
// COUNTDOWN
//---------------------------------------------------------------------
function addCountdown(builder: PanelOptionsEditorBuilder<SimpleOptions>) {
  const category = ['Countdown'];
  builder
    .addTextInput({
      category,
      path: 'countdownSettings.endCountdownTime',
      name: 'End Time',
      settings: {
        placeholder: 'ISO 8601 or RFC 2822 Date time',
      },
      defaultValue: dateTime(Date.now())
        .add(6, 'h')
        .format(),
      showIf: o => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endText',
      name: 'End Text',
      defaultValue: '00:00:00',
      showIf: o => o.mode === ClockMode.countdown,
    })

    .addTextInput({
      category,
      path: 'countdownSettings.customFormat',
      name: 'Custom format',
      settings: {
        placeholder: 'optional',
      },
      defaultValue: undefined,
      showIf: o => o.mode === ClockMode.countdown,
    });
}

//---------------------------------------------------------------------
// TIME FORMAT
//---------------------------------------------------------------------
function addTimeFormat(builder: PanelOptionsEditorBuilder<SimpleOptions>) {
  const category = ['Time Format'];

  builder
    .addRadio({
      category,
      path: 'clockType',
      name: 'Clock Type',
      settings: {
        options: [
          { value: ClockType.H24, label: '24 Hour' },
          { value: ClockType.H12, label: '12 Hour' },
          { value: ClockType.Custom, label: 'Custom' },
        ],
      },
      defaultValue: ClockType.H24,
    })
    .addTextInput({
      category,
      path: 'timeSettings.customFormat',
      name: 'Time Format',
      description: 'the date formatting pattern',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: undefined,
      showIf: opts => opts.clockType === ClockType.Custom,
    })
    .addTextInput({
      category,
      path: 'timeSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: '12px',
    })
    .addRadio({
      category,
      path: 'timeSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
    });
}

//---------------------------------------------------------------------
// TIMEZONE
//---------------------------------------------------------------------
function addTimeZone(builder: PanelOptionsEditorBuilder<SimpleOptions>) {
  const category = ['Timezone'];

  const timezones = getTimeZoneNames().map(n => {
    return { label: n, value: n };
  });
  timezones.unshift({ label: 'Default', value: '' });

  builder
    .addSelect({
      category,
      path: 'timezone',
      name: 'Timezone',
      settings: {
        options: timezones,
      },
      defaultValue: '',
    })
    .addBooleanSwitch({
      category,
      path: 'timezoneSettings.showTimezone',
      name: 'Show Timezone',
      defaultValue: false,
    })
    .addSelect({
      category,
      path: 'timezoneSettings.zoneFormat',
      name: 'Display Format',
      settings: {
        options: [
          { value: ZoneFormat.name, label: 'Normal' },
          { value: ZoneFormat.nameOffset, label: 'Name + Offset' },
          { value: ZoneFormat.offsetAbbv, label: 'Offset + Abbreviation' },
          { value: ZoneFormat.offset, label: 'Offset' },
          { value: ZoneFormat.abbv, label: 'Abbriviation' },
        ],
      },
      defaultValue: ZoneFormat.offsetAbbv,
      showIf: s => s.timezoneSettings?.showTimezone,
    })
    .addTextInput({
      category,
      path: 'timezoneSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'font size',
      },
      defaultValue: '12px',
      showIf: s => s.timezoneSettings?.showTimezone,
    })
    .addRadio({
      category,
      path: 'timezoneSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: s => s.timezoneSettings?.showTimezone,
    });
}

//---------------------------------------------------------------------
// DATE FORMAT
//---------------------------------------------------------------------
function addDateFormat(builder: PanelOptionsEditorBuilder<SimpleOptions>) {
  const category = ['Date Options'];

  builder
    .addBooleanSwitch({
      category,
      path: 'dateSettings.showDate',
      name: 'Show Date',
      defaultValue: false,
    })
    .addTextInput({
      category,
      path: 'dateSettings.dateFormat',
      name: 'Date Format',
      settings: {
        placeholder: 'Enter date format',
      },
      defaultValue: 'YYYY-MM-DD',
      showIf: s => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.locale',
      name: 'Locale',
      settings: {
        placeholder: 'Enter locale: de, fr, es, ... (default: en)',
      },
      defaultValue: '',
      showIf: s => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: '20px',
      showIf: s => s.dateSettings?.showDate,
    })
    .addRadio({
      category,
      path: 'dateSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: s => s.dateSettings?.showDate,
    });
}

function addEcharts(builder: PanelOptionsEditorBuilder<SimpleOptions>) {
  const category = ['Echart Options [DONT EDIT]'];
  builder.addTextInput({
    category,
    path: 'getOption',
    name: 'Echarts options',
    description: 'Return options called by echarts or just use echartsInstance.setOption(...).',
    defaultValue: `
    return {
      tooltip: {
          formatter: "{a}：{c}"
        },
      series: [{ ///////////////////////////////////////////////小表盘24小时
          name: 'Hour',
          type: 'gauge',
          center: ['28%', '50%'], // Globally centered by default
          radius: '22%', //仪表盘半径
          min: 0,
          max: 24,
          startAngle: 90,
          endAngle: -269.9999,
          splitNumber: 24,
          animation: 0,
          pointer: { //仪表盘指针
            show: 1,
            length: '90%',
            width: 3
          },
          itemStyle: { //仪表盘指针样式
            normal: {
              color: '#00b0b0',
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            }
          },
          axisLine: { //仪表盘轴线样式 
            lineStyle: {
              color: [
                [1, '#337ab7']
              ],
              width: 6
            }
          },
          splitLine: { //分割线样式 
            length: 6,
            lineStyle: {
              width: 1
            }
          },
          axisTick: { //仪表盘刻度样式
            show: 0,
            splitNumber: 5, //分隔线之间分割的刻度数
            length: 5, //刻度线长
            lineStyle: {
              color: ['#ffffff']
            }
          },
          axisLabel: { //刻度标签
            show: 1,
            distance: 2, //标签与刻度线的距离
            textStyle: {
              color: '#0000ff',
              fontFamily: '宋体'
            },
            formatter: function(t) {
              switch (t + '') {
                case '0':
                  return '';
                case '1':
                  return '';
                case '2':
                  return '';
                case '3':
                  return '3';
                case '4':
                  return '';
                case '5':
                  return '';
                case '6':
                  return '6';
                case '7':
                  return '';
                case '8':
                  return '';
                case '9':
                  return '9';
                case '10':
                  return '';
                case '11':
                  return '';
                case '12':
                  return '12';
                case '13':
                  return '';
                case '14':
                  return '';
                case '15':
                  return '15';
                case '16':
                  return '';
                case '17':
                  return '';
                case '18':
                  return '18';
                case '19':
                  return '';
                case '20':
                  return '';
                case '21':
                  return '21';
                case '22':
                  return '';
                case '23':
                  return '';
                case '24':
                  return '24';
              }
            }
          },
          title: { //仪表盘标题
            show: 1,
            offsetCenter: ['200%', '-210%'],
            textStyle: {
              color: '#a0a0a0',
              fontSize: 24,
              fontWeight: 'bold',
              fontFamily: 'Arial'
            }
          },
          detail: { //仪表盘显示数据
            show: 0,
            formatter: '{value}',
            offsetCenter: [0, '60%']
          },
          data: [{
            name: ''
          }]
        }, { ///////////////////////////////////////////////小表盘星期
          name: 'Week',
          type: 'gauge',
          center: ['72%', '50%'], // 默认全局居中
          radius: '22%', //仪表盘半径
          min: 0,
          max: 7,
          startAngle: 90,
          endAngle: -269.9999,
          splitNumber: 7,
          animation: 0,
          pointer: { //仪表盘指针
            show: true,
            length: '80%',
            width: 3
          },
          itemStyle: { //仪表盘指针样式
            normal: {
              color: '#00b0b0',
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            }
          },
          axisLine: { //仪表盘轴线样式 
            lineStyle: {
              color: [
                [0.07, 'rgba(192, 0, 0, 0.5)'],
                [0.21, 'rgba(0, 0, 192, 0.5)'],
                [0.35, 'rgba(0, 64, 192, 0.5)'],
                [0.50, 'rgba(0, 96, 192, 0.5)'],
                [0.64, 'rgba(0, 164, 192, 0.5)'],
                [0.78, 'rgba(0, 128, 64, 0.5)'],
                [0.93, 'rgba(192, 128, 0, 0.5)'],
                [1, 'rgba(192, 0, 0, 0.5)']
              ],
              width: 18
            }
          },
          splitLine: { //分割线样式 
            show: 0,
            length: 18,
            lineStyle: {
              width: 1
            }
          },
          axisTick: {
            show: 0
          }, //仪表盘刻度样式
          axisLabel: { //刻度标签
            show: 1,
            distance: -15, //标签与刻度线的距离
            textStyle: {
              color: '#ffffff'
            },
            formatter: function(t) {
              switch (t + '') {
                case '0':
                  return '7';
                case '1':
                  return '1';
                case '2':
                  return '2';
                case '3':
                  return '3';
                case '4':
                  return '4';
                case '5':
                  return '5';
                case '6':
                  return '6';
              }
            }
          },
          title: {
            show: 0
          }, //仪表盘标题
          detail: {
            show: 0
          }, //仪表盘显示数据
          data: [{}]
        }, { ///////////////////////////////////////////////小表盘月
          name: 'Month',
          type: 'gauge',
          center: ['50%', '72%'], // 默认全局居中
          radius: '22%', //仪表盘半径
          min: 0,
          max: 12,
          startAngle: 90,
          endAngle: -269.9999,
          splitNumber: 12,
          animation: 0,
          pointer: { //仪表盘指针
            show: 1,
            length: '90%',
            width: 3
          },
          itemStyle: { //仪表盘指针样式
            normal: {
              color: '#00b0b0',
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            }
          },
          axisLine: { //仪表盘轴线样
            lineStyle: {
              color: [
                [1, '#337ab7']
              ],
              width: 6
            }
          },
          splitLine: { //分割线样式 
            show: 1,
            length: 6,
            lineStyle: {
              width: 1
            }
          },
          axisTick: {
            show: 0
          }, //仪表盘刻度样式
          axisLabel: { //刻度标签
            show: 1,
            distance: 1, //标签与刻度线的距离
            textStyle: {
              color: '#0000ff',
              fontFamily: '宋体'
            },
            formatter: function(t) {
              switch (t + '') {
                case '2':
                  return '2';
                case '4':
                  return '4';
                case '6':
                  return '6';
                case '8':
                  return '8';
                case '10':
                  return '10';
                case '12':
                  return '12';
              }
            }
          },
          detail: {
            show: 0
          }, //仪表盘显示数据
          data: [{}]
        }, { ///////////////////////////////////////////////小表盘日
          type: 'gauge',
          center: ['50%', '72%'], // 默认全局居中
          radius: '22%', //仪表盘半径
          animation: 0,
          pointer: {
            width: 0
          }, //仪表盘指针
          axisLine: { //仪表盘轴线样式 
            lineStyle: {
              show: 0,
              width: 0
            }
          },
          splitLine: {
            show: 0
          }, //分割线样式 
          axisTick: {
            show: 0
          }, //仪表盘刻度样式
          axisLabel: {
            show: 0
          }, //刻度标签
          detail: { //仪表盘显示数据
            show: 1,
            formatter: function(e) {
              if (e < 10)
                e = '0' + e;
              return e;
            },
            offsetCenter: ['160%', 0],
            borderWidth: 2,
            borderColor: '#337ab7',
            backgroundColor: '#A0A0A0',
            height: 20,
            width: 28,
            textStyle: {
              color: '#ffff00',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Arial'
            },
          },
          data: [{}]
        }, { ///////////////////////////////////////////////大表盘时针
          name: 'Hour',
          type: 'gauge',
          radius: '90%', //仪表盘半径
          min: 0,
          max: 12,
          startAngle: 90,
          endAngle: -269.9999,
          splitNumber: 12,
          animation: 0,
          pointer: { //仪表盘指针
            length: '70%',
            width: 6
          },
          itemStyle: { //仪表盘指针样式
            normal: {
              color: '#109A39',
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            }
          },
          axisLine: { //仪表盘轴线样式 
            show: 0,
            lineStyle: {
              color: [
                [1, '#337ab7']
              ],
              width: 10,
              shadowColor: 'rgba(0, 0, 0, 0.8)',
              shadowBlur: 12,
              shadowOffsetX: 3,
              shadowOffsetY: 3
            }
          },
          splitLine: { //分割线样式 
            length: 10,
            lineStyle: {
              width: 2
            }
          },
          axisTick: { //仪表盘刻度样式
            show: true,
            splitNumber: 5, //分隔线之间分割的刻度数
            length: 5, //刻度线长
            lineStyle: {
              color: ['#ffffff']
            }
          },
          axisLabel: {
            show: 0
          }, //刻度标签
          title: {
            show: 0
          }, //仪表盘标题
          detail: {
            show: 0
          }, //仪表盘显示数据
          data: [{}]
        }, { ///////////////////////////////////////////////大表盘分针
          name: 'Minute',
          type: 'gauge',
          radius: '90%', //仪表盘半径
          min: 0,
          max: 12,
          startAngle: 90,
          endAngle: -269.9999,
          splitNumber: 12,
          animation: 0,
          pointer: { //仪表盘指针
            length: '85%',
            width: 6
          },
          itemStyle: { //仪表盘指针样式
            normal: {
              color: '#ca8622',
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            }
          },
          axisLine: { //仪表盘轴线样式 
            show: 0,
            lineStyle: {
              width: 0
            }
          },
          splitLine: { //分割线样式 
            length: 10,
            lineStyle: {
              width: 2
            }
          },
          axisTick: { //仪表盘刻度样式
            show: true,
            splitNumber: 5, //分隔线之间分割的刻度数
            length: 5, //刻度线长
            lineStyle: {
              color: ['#ffffff']
            }
          },
          axisLabel: {
            show: 0
          }, //刻度标签
          title: {
            show: 0
          }, //仪表盘标题
          detail: {
            show: 0
          }, //仪表盘显示数据
          data: [{}]
        }, { ///////////////////////////////////////////////大表盘秒针
          name: 'Second',
          type: 'gauge',
          radius: '90%', //仪表盘半径
          min: 0,
          max: 60,
          startAngle: 90,
          endAngle: -269.9999,
          splitNumber: 12,
          animation: 0,
          pointer: { //仪表盘指针
            show: true,
            length: '95%',
            width: 4
          },
          itemStyle: { //仪表盘指针样式
            normal: {
              color: '#00b0b0',
              shadowColor: 'rgba(0, 0, 0, 0.8)',
              shadowBlur: 10,
              shadowOffsetX: 4,
              shadowOffsetY: 4
            }
          },
          axisLine: { //仪表盘轴线样式 
            lineStyle: {
              color: [
                [1, '#337ab7']
              ],
              width: 10
            }
          },
          splitLine: { //分割线样式 
            length: 10,
            lineStyle: {
              width: 2
            }
          },
          axisTick: { //仪表盘刻度样式
            show: 1,
            splitNumber: 5, //分隔线之间分割的刻度数
            length: 5, //刻度线长
            lineStyle: {
              color: ['#fff']
            }
          },
          axisLabel: { //刻度标签
            show: 1,
            distance: 6, //标签与刻度线的距离
            textStyle: {
              fontWeight: 'bold',
              fontSize: 16
            },
            formatter: function(t) {
              switch (t + '') {
                case '0':
                  return '';
                case '5':
                  return '1';
                case '10':
                  return '2';
                case '15':
                  return '3';
                case '20':
                  return '4';
                case '25':
                  return '5';
                case '30':
                  return '6';
                case '35':
                  return '7';
                case '40':
                  return '8';
                case '45':
                  return '9';
                case '50':
                  return '10';
                case '55':
                  return '11';
                case '60':
                  return '12';
              }
            }
          },
          title: {
            show: 0
          }, //仪表盘标题
          detail: { //仪表盘显示数据
            show: 0,
            formatter: '{value}',
            offsetCenter: [0, '60%']
          },
          data: [{}]
        }]
      };`,
  });
}

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    colorPicker: css`
      padding: 0 ${theme.spacing.sm};
    `,
    inputPrefix: css`
      display: flex;
      align-items: center;
    `,
    trashIcon: css`
      color: ${theme.colors.textWeak};
      cursor: pointer;

      &:hover {
        color: ${theme.colors.text};
      }
    `,
  };
});
