#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var program = require('commander');

// ^9 以上的inquirer 和 ^5 chalk 不支持 require
var inquirer = require('inquirer');
var chalk = require('chalk');
const generateFile = require('../src/template.js')

generateFile()
program
  .version('1.0.0', '-v, --version')
  .command('create [createname]')
  .alias('c')
  .description('这是一个帮助提示')
  .option('-a, --modulename [moduleName]', '模块名称')
  .action((createName) => {
    console.log('指令 create 后面跟的参数值 createname: ' + createName);
    // 获得了参数，可以在这里做响应的业务处理
    //用户交互配置，支持多种方式的输入
    var prompList = [
      {
          type:'input',
          message:'姓名',
          name:'name'
      },{
          type:'input',
          message:'手机号',
          name:'phone',
          validate:val=>{
              if(val.match(/\d{11}/g)){
                  return true
              }
              return '请输入11位数字'
          }
      },{
          type:'confirm',
          message:'是否参加测试？',
          name:'assess',
          prefix:'前缀'
      },{
          type:'confirm',
          message:'是否同意协议？',
          name:'notice',
          suffix:'后缀',
          when:answers=>{
              return answers.assess
          }
      },{
          type:'list',
          message:'请选择学历：',
          name:'eductionBg',
          choices:[
              "大专",
              "本科",
              "本科以上"
          ],
          filter:val=>{//将选择的内容后面加学历
              return val+'学历'
          }
      },{
          type:'rawlist',
          message:'请选择你爱玩的游戏：',
          name:'game',
          choices:[
              "农药",
              "吃鸡",
          ]
      },{
          type:'expand',
          message:'请选择你喜欢的水果：',
          name:'fruit',
          choices: [
              {
                  key: "a",
                  name: "Apple",
                  value: "apple"
              },
              {
                  key: "O",
                  name: "Orange",
                  value: "orange"
              },
              {
                  key: "p",
                  name: "Pear",
                  value: "pear"
              }
          ]
      },{
          type:'checkbox',
          message:'请选择你喜欢的颜色：',
          name:'color',
          choices:[
              {
                  name: "red"
              },
              new inquirer.Separator(), // 添加分隔符
              {
                  name: "blur",
                  checked: true // 默认选中
              },
              {
                  name: "green"
              },
              new inquirer.Separator("--- 分隔符 ---"), // 自定义分隔符
              {
                  name: "yellow"
              }
          ]
      }
    ]
    //获取用户的输入结果
    inquirer.prompt(prompList).then(answers=>{
      console.log(answers);//用户输入结果
      generateFile()
    })
  })
  //自定义帮助信息
  .on('--help', function () {
      console.log('把相亲对象组成球队')
      console.log('去夺下那世界杯')
  })

program.parse(process.argv)