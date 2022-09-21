let templateFile = `stages: # 自定义分段
  - preInstall
  - install
  - release
  - build
  - deploy
  - notify
  
variables:
  WEBHOOK_KEY: [webhookKey]
  GIT_CLEAN_FLAGS: -fdx -e node_modules/
  OSS_UAT: [ossUat]
  OSS_PROD: [ossProd]

preInstall-job:
  stage: preInstall
  only: # 控制仅在以下情况触发job，多个条件是逻辑且的关系
    refs: # 触发分支
      - UAT
      - master
    changes: #仅在git push事件中修改了下列文件触发job
      - package.json
  script:
    - echo "依赖发生变化,开始install🔥🔥🔥"
    - if [ -d "./node_modules/.cache" ];then  mv node_modules/.cache ./; fi
    - npm ci
    - if [ -d ".cache" ];then  mv .cache node_modules; fi
    - echo "完成install🔥🔥🔥"

install-job:
  stage: install
  only: # only没有子选项，默认表现为 only:refs，only:refs中多个条件为逻辑或
    - UAT
    - master
  script:
    - node -v
    - echo "开始install🔥🔥🔥"
    - if [ ! -d "./node_modules/" ];then   npm ci;   else   echo "缓存存在,跳过install"; fi
    - echo "完成install🔥🔥🔥"

#releaseBegin
release-job: # 打tag + 生成changelog
  stage: release
  only:
    - master
  before_script:
    - git config --global user.name "\${GITLAB_USER_NAME}"
    - git config --global user.email "\${GITLAB_USER_EMAIL}"
  script:
    - npm run release
    - git push -o ci.skip http://$USER:$GITLAB_TOKEN@$CI_SERVER_HOST/$CI_PROJECT_PATH.git HEAD:master
    - git push --tags http://$USER:$GITLAB_TOKEN@$CI_SERVER_HOST/$CI_PROJECT_PATH.git HEAD:master
  after_script:
    - git config --global --unset user.name
    - git config --global --unset user.email
#releaseEnd

build-job:
  stage: build
  only:
    - UAT
    - master
  script:
    - echo "开始代码打包💪💪💪"
    - if [ $CI_COMMIT_BRANCH == 'UAT' ];then  npm run uat; fi
    - if [ $CI_COMMIT_BRANCH == 'master' ];then  npm run build; fi
    - echo "完成代码打包💪💪💪"
  artifacts: # 下一个job会自动下载当前 job 的 artifacts，理解为下一个 job 执行的依赖
    name: 'bundle'
    paths: 
      - dist
    expire_in: 1 week # 有效时间

deploy-uat-job:
  stage: deploy
  environment: UAT 
  only:
    - UAT
  before_script:
    - echo "发射到目标服务器✨✨✨"
  script:
    - /app/ossutil/bin/ossutil64  cp -rf ./dist $OSS_UAT -c [ossConfig]
  after_script:
    - echo "完成更新👏👏👏"
deploy-prod-job:
  stage: deploy
  environment: master
  rules:
    - if: $CI_COMMIT_BRANCH == "master"
      when: manual
  before_script:
    - echo "发射到目标服务器✨✨✨"
  script:
    - /app/ossutil/bin/ossutil64  cp -rf ./dist $OSS_PROD -c [ossConfig]
  after_script:
    - echo "完成更新👏👏👏"

#notifyBegin
notifyFailWeChat:
  stage: notify
  only:
    - UAT
    - master
  script:
    - /app/push_notify.sh $WEBHOOK_KEY "发版失败"
  when: on_failure
notifySuccessWeChat:
  stage: notify
  only:
    - UAT
    - master
  script:
    - /app/push_notify.sh $WEBHOOK_KEY "发版成功"
  when: on_success
#notifyEnd
`
/**
 * @param {Object} answers 
 * @param {string} answers.ossUat 
 * @param {string} answers.ossProd 
 * @param {boolean} answers.notifyNeed 
 * @param {string} answers.webhookKey 
 * @param {boolean} answers.autoTag 
 * @param {string} answers.ossConfig
 */
module.exports = function (answers) {
  templateFile = templateFile.replace('[ossUat]', answers.ossUat)
  templateFile = templateFile.replace('[ossProd]', answers.ossProd)
  // 不需要notify
  if(!answers.notifyNeed) {
    templateFile = templateFile.replace('  - notify\n', '')
    const indexBegin = templateFile.indexOf('#notifyBegin')
    const indexEnd = templateFile.indexOf('#notifyEnd')
    templateFile = templateFile.slice(0, indexBegin) + templateFile.slice(indexEnd + 11)
  } else {
    templateFile = templateFile.replace('[webhookKey]', answers.webhookKey || '[webhookKey]' )
  }

  // 不要打签
  if(!answers.autoTag) {
    templateFile = templateFile.replace('  - release\n', '')
    const indexBegin = templateFile.indexOf('#releaseBegin')
    const indexEnd = templateFile.indexOf('#releaseEnd')
    templateFile = templateFile.slice(0, indexBegin) + templateFile.slice(indexEnd + 12)
  } 

  templateFile = templateFile.replace(/\[ossConfig\]/g, answers.ossConfig)
  return templateFile
}