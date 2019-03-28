const path = require('path')
const when = (condition, value, fallback) => (condition ? value : fallback)

module.exports = {
  prompts () {
    return [
      {
        name: 'features',
        message: 'Check the features needed for your project:',
        type: 'checkbox',
        default: ['css-pre-processors', 'eslint'],
        choices: [
          {
            name: 'Typescript',
            value: 'typescript'
          },
          {
            name: 'CSS Pre-processors',
            value: 'css-pre-processors'
          },
          {
            name: 'Eslint (check and format code)',
            value: 'eslint'
          },
          {
            name: 'Vuex',
            value: 'vuex'
          }
        ]
      },
      {
        name: 'cssPreset',
        message: 'Choose CSS Pre-processors',
        type: 'list',
        choices: [
          {
            name: 'Sass/SCSS',
            value: 'scss'
          },
          {
            name: 'Less',
            value: 'less'
          },
          {
            name: 'Stylus',
            value: 'stylus'
          }
        ],
        when: ({ features }) => features.includes('css-pre-processors')
      },
      {
        name: 'needPx2Rpx',
        message: 'Need px2rpx loader',
        type: 'list',
        choices: ['Yes', 'No']
      },
      {
        name: 'needMegaloAPI',
        message: 'Need megalo api',
        type: 'list',
        choices: ['No', 'Yes']
      }
    ]
  },
  templateData() {
    return {
      projectName: this.outFolder
    }
  },
  actions () {
    const { features } = this.answers
    return [
      {
        type: 'add',
        templateDir: `templates/${features.includes('typescript') ? 'typescript' : 'main'}`,
        files: '**',
        filters: {
          'eslint*': features.includes('eslint')
        }
      },
      {
        type: 'move',
        patterns: {
          'gitignore': '.gitignore',
          'README': 'README.md',
          'package': 'package.json',
          'eslintignore': '.eslintignore',
          'eslintrc': '.eslintrc.js'
        }
      },
      {
        type: 'modify',
        files: 'package.json',
        handler: () => {
          const { features, cssPreset, needMegaloAPI } = this.answers
          return {
            'name': this.outFolder,
            'version': '1.0.0',
            'private': true,
            'scripts': {
              'build:wechat': 'megalo-cli-service build',
              'build:alipay': 'megalo-cli-service build --platform alipay',
              'build:swan': 'megalo-cli-service build --platform swan',
              'dev:alipay': 'megalo-cli-service serve --platform alipay',
              'dev:swan': 'megalo-cli-service serve --platform swan',
              'dev:wechat': 'megalo-cli-service serve',
              'lint': when(features.includes('eslint'), 'eslint --fix --ext .js,.ts,.vue src')
            },
            'license': 'ISC',
            'babel': {
              'presets': [
                '@megalo/app'
              ]
            },
            'devDependencies': {
              '@megalo/babel-preset-app': 'latest',
              '@megalo/cli-service': 'latest',
              '@megalo/eslint-config-standard': when(features.includes('eslint'), 'latest'),
              "@megalo/eslint-config-typescript": when(features.includes('typescript') && features.includes('eslint'), 'latest'),
              '@megalo/target': 'latest',
              '@megalo/template-compiler': 'latest',
              "@types/node": when(features.includes('typescript'), '^11.11.4'),
              'eslint': when(features.includes('eslint'), '^5.15.3'),
              'less': when(cssPreset === 'less', '^3.8.1'),
              'less-loader': when(cssPreset === 'less', '^4.1.0'),
              'stylus': when(cssPreset === 'stylus', '^0.54.5'),
              'stylus-loader': when(cssPreset === 'stylus', '^3.0.2'),
              'node-sass': when(cssPreset === 'sass', '^4.10.0'),
              'sass-loader': when(cssPreset === 'sass', '^7.1.0'),
              "typescript": when(features.includes('typescript'), '^3.3.4000'),
              "vue-property-decorator": when(features.includes('typescript'), '^7.3.0')
            },
            'dependencies': {
              '@megalo/api': when(needMegaloAPI === 'Yes', '^0.2.2'),
              '@megalo/vhtml-plugin': '^0.1.2',
              'megalo': 'latest',
              'octoparse': '^0.3.2'
            }
          }
        }
      }
    ]
  },
  async completed () {
    await this.npmInstall()
    this.showProjectTips()
    const logCd = () => {
      if (this.outDir !== process.cwd()) {
        console.log(
          `${this.chalk.bold('cd')} ${this.chalk.cyan(
            path.relative(process.cwd(), this.outDir)
          )}`
        )
      }
    }

    this.logger.tip(`To start dev server, run following commands:`)
    logCd()
    console.log(
      `${this.chalk.cyan('npm run dev:wechat')}`
    )

    this.logger.tip(`To build for production, run following commands:`)
    logCd()
    console.log(
      `${this.chalk.cyan('npm run build:wechat')}`
    )
  }
}
