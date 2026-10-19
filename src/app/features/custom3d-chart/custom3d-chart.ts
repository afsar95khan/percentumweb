import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { EChartsOption, CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams } from 'echarts';
import * as echarts from 'echarts';

@Component({
  selector: 'app-custom-3d-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  styleUrl: './custom3d-chart.css',
  templateUrl: './custom3d-chart.html',
})
export class Custom3dChart {
 
  chartOptions: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'none' }
    },
    xAxis: {
      type: 'category',
      data: ['DNB Fastrenteinnskudd', 'ODIN Rente', 'Oslo Børs', 'Crowdfunding'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
        margin: 20,
        interval: 0,
        width: 140,
        overflow: 'break'
      }
    },
    yAxis: {
      type: 'value',
      show: false,
      max: 100
    },
    series: [
      {
        type: 'custom',
        encode: { x: 0, y: 1 },
        renderItem: (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI) => {
          const xValue = api.value(0);
          const yValue = api.value(1);
         
          const start = api.coord([xValue, 0]);
          const end = api.coord([xValue, yValue]);
          const size = api.size!([1, 0]);
          const width = (Array.isArray(size) ? size[0] : size) * 0.5;
          const depth = width * 0.4;
         
          const x = end[0];
          const y = end[1];
          const y0 = start[1];

          // Colors based on image_654ff1.png
          const colors = [
            { base: '#2c356b', left: '#242b58', right: '#36407e', top: '#1c2247' },
            { base: '#b5c627', left: '#a4b323', right: '#c2d42b', top: '#8a961d' },
            { base: '#e6281e', left: '#cc231a', right: '#f03026', top: '#a31c15' },
            { base: '#e89b25', left: '#d48d22', right: '#f2a630', top: '#b3761c' }  
          ];
          const colorSet = colors[params.dataIndex];

          return {
            type: 'group',
            children: [
              // Left Face
              {
                type: 'polygon',
                shape: {
                  points: [
                    [x - width / 2, y0 - depth],
                    [x, y0],                    
                    [x, y],                      
                    [x - width / 2, y - depth]  
                  ]
                },
                style: { fill: colorSet.left }
              },
              // Right Face
              {
                type: 'polygon',
                shape: {
                  points: [
                    [x, y0],                    
                    [x + width / 2, y0 - depth],
                    [x + width / 2, y - depth],  
                    [x, y]                      
                  ]
                },
                style: { fill: colorSet.right }
              },
              // Top Face
              {
                type: 'polygon',
                shape: {
                  points: [
                    [x - width / 2, y - depth],  
                    [x, y],                      
                    [x + width / 2, y - depth],  
                    [x, y - depth * 2]          
                  ]
                },
                style: { fill: colorSet.top }
              },
              {
                type: 'text',
                style: {
                  x,
                  y: y - depth * 2 - 8,
                  text: '3.5%',
                  fill: '#001a4d',
                  font: 'bold 20px sans-serif',
                  textAlign: 'center',
                  textVerticalAlign: 'bottom'
                }
              }
            ]
          };
        },
        data: [
          { value: [0, 30] },
          { value: [1, 50] },
          { value: [2, 75] },
          { value: [3, 95] }
        ]
      }
    ]
  };
}