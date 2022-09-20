#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var program = require('commander');

// ^9 以上的inquirer 和 ^5 chalk 不支持 require
var inquirer = require('inquirer');

const generateFile = require('../src/template.js')

program
  .version('1.0.0', '-v, --version')
  .command('create')
  .alias('c')
  .description('根据模版创建.gitlab-ci.yml')
  .action(() => {
    //用户交互配置，支持多种方式的输入
    var prompList = [
      {
          type:'input',
          message:'测试环境oss地址',
          name:'ossUat'
      },
      {
          type:'input',
          message:'生产环境oss地址',
          name:'ossProd'
      },
      {
        type:'confirm',
        message:'是否需要把结果通知到企业微信(需要企微机器人的webhook key)？',
        name:'notifyNeed',
      },
      {
        type:'input',
        message:'webhook key',
        name:'webhookKey',
        when: (answers) => answers.notifyNeed
      },
      {
        type:'confirm',
        message:'是否需要自动化打签？',
        name:'autoTag',
      },
      {
        type:'input',
        message:'输入oss config路径：',
        name:'ossConfig',
      }
    ]
    //获取用户的输入结果
    inquirer.prompt(prompList).then(answers => {
      const fileContent = generateFile(answers)
      const filePath = '.gitlab-ci.yml'
      fs.writeFileSync(filePath, fileContent)
    })
  })

program.parse(process.argv)