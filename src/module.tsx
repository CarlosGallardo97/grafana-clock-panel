// @ts-ignore
import { PanelPlugin } from '@grafana/ui';
// import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';
import { optionsBuilder } from './SimpleEditor';

//export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setDefaults(defaults).setEditor(SimpleEditor);

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(optionsBuilder);
//  return builder
//    .addBooleanSwitch({
//      path: 'followTheme',
//      name: 'Follow Grafana Theme',
//      description: 'Use default theme or follow theme of grafana (light or dark).',
//      defaultValue: defaults.followTheme,
//    })
//    .addTextInput({
//      path: 'getOption',
//      name: 'Echarts options',
//      description: 'Return options called by echarts or just use echartsInstance.setOption(...).',
//      defaultValue: defaults.getOption,
//    });
//});
