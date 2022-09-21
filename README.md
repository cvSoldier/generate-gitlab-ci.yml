# generate-gitlab-ci.yml
<a href="https://www.npmjs.com/package/generate-gitlab-ci.yml"><img src="https://img.shields.io/npm/v/generate-gitlab-ci.yml.svg?sanitize=true" alt="Version"></a>  

一个可以生成gitlab-ci.yml文件的cli工具

## 安装
```
npm i generate-gitlab-ci.yml -g
```

执行 `gen-ci-yml -v` 来确认安装成功

## 使用
进入到需要创建的根目录执行
```
gen-ci-yml -c
```
然后根据[内置模版](https://github.com/cvSoldier/generate-gitlab-ci.yml/blob/main/src/template.js)和你填入的内容快速生成gitlab-ci.yml！:tada::tada::tada:
