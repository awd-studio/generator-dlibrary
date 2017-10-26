'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');

// Generator constants
const drupal7 = '7';
const drupal8 = '8';

module.exports = class extends Generator {
  prompting() {
    // Base dir path
    this.baseDir = path.basename(process.cwd());

    // Module machine name
    this.moduleNameMachine = this.baseDir.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    this.moduleNameDefault =
      this.moduleNameMachine.charAt(0).toUpperCase() + this.moduleNameMachine.slice(1);
    this.moduleDescriptionDefault = 'My custom module';

    // Have Yeoman greet the user.
    this.log(
      yosay(
        'Yo! Here is an Awesome ' + chalk.red('Drupal Library Module') + ' generator!'
      )
    );

    /** Promting */
    const prompts = [
      {
        type: 'list',
        name: 'drupalCore',
        message: 'Choose Drupal core:',
        default: drupal7,
        // choices: [drupal7, drupal8] // ToDo: Realize Drupal 8 version
        choices: [drupal7]
      },
      {
        name: 'moduleNameHuman',
        message: 'Say me the name of your module:',
        default: this.moduleNameDefault.replace(/_/gi, ' ')
      },
      {
        name: 'moduleDescription',
        message: 'Describe your module:',
        default: this.moduleDescriptionDefault
      },
      {
        name: 'modulePackage',
        message: 'Set the package:',
        default: 'Custom'
      },
      {
        name: 'moduleDependencies',
        message: 'Module dependencies ' + chalk.dim('(space or comma separated)') + ':'
      },
      {
        type: 'list',
        name: 'libraryType',
        message: 'Yype of library:',
        default: 'js',
        choices: ['js', 'php']
      },
      {
        name: 'libraryName',
        message: 'Library Name:',
        validate: function(answer) {
          if (answer.length < 1) {
            return chalk.bgRed('This option is required!');
          }

          return true;
        },
        default: 'Vue.js' // ToDo: Delete!
      },
      {
        name: 'libraryRepo',
        message: 'Library GitHub repository URL:',
        validate: function(answer) {
          if (answer.length < 1) {
            return chalk.bgRed('This option is required!');
          }

          return true;
        },
        default: 'https://github.com/vuejs/vue' // ToDo: Delete!
      },
      {
        name: 'libraryRepoBranch',
        message: 'Library repository branch:',
        validate: function(answer) {
          if (answer.length < 1) {
            return chalk.bgRed('This option is required!');
          }

          return true;
        },
        default: 'master'
      },
      {
        name: 'libraryFile',
        message: 'Library include File:',
        validate: function(answer) {
          if (answer.length < 1) {
            return chalk.bgRed('This option is required!');
          }

          return true;
        },
        default: 'dist/vue.min.js' // ToDo: Delete!
      },
      {
        name: 'libraryVersionFile',
        message: 'Library Version Arguments File:',
        validate: function(answer) {
          if (answer.length < 1) {
            return chalk.bgRed('This option is required!');
          }

          return true;
        },
        default: 'dist/vue.min.js' // ToDo: Delete!
      },
      {
        name: 'libraryVersionPattern',
        message: 'Library Version Arguments Pattern:',
        validate: function(answer) {
          if (answer.length < 1) {
            return chalk.bgRed('This option is required!');
          }

          return true;
        },
        default: 'v(\\d+\\.\\d+\\.\\d+)' // ToDo: Delete!
      },
      {
        name: 'libraryVersionLines',
        message: 'Library Version Arguments Lines:',
        validate: function(answer) {
          if (answer.length < 1) {
            return chalk.bgRed('This option is required!');
          }

          if (typeof answer !== 'number') {
            return chalk.bgRed('You need to provide a number!');
          }

          return true;
        },
        default: 2 // ToDo: Delete!
      },
      {
        type: 'confirm',
        name: 'drushCommand',
        message: 'Implement Drush Command?'
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    /**
     * Variables
     */
    this.data = {
      drupalCore: this.props.drupalCore,
      libraryName: this.props.libraryName,
      libraryType: this.props.libraryType,
      libraryFile: this.props.libraryFile,
      libraryRepo: this.props.libraryRepo,
      libraryRepoBranch: this.props.librarylibraryRepoBranch,
      libraryVersionFile: this.props.libraryVersionFile,
      libraryVersionPattern: this.props.libraryVersionPattern,
      libraryVersionLines: this.props.libraryVersionLines,
      libraryRepoDownload:
        this.props.libraryRepo + '/archive/' + this.props.libraryRepoBranch + '.zip',
      libraryExtractPreffix: this.props.libraryRepo.split('/').pop() + '-',
      moduleNameMachine: this.moduleNameMachine,
      moduleNameDash: this.moduleNameMachine.replace(/_/, '-'),
      moduleNameHuman: this.props.moduleNameHuman,
      moduleNameUpper: this.moduleNameMachine.toUpperCase(),
      moduleDescription: this.props.moduleDescription,
      modulePackage: this.props.modulePackage,
      moduleDependencies:
        'dependencies[] = ' +
        ('libraries' +
          (this.props.moduleDependencies.length ? ' ' : '') +
          this.props.moduleDependencies
        )
          .split(' ')
          .join('\ndependencies[] = ')
    };

    if (this.props.drupalCore === drupal7) {
      /**
       * Create module.info
       */
      this.fs.copyTpl(
        this.templatePath(this.props.drupalCore + '/_template.info'),
        this.destinationPath(this.moduleNameMachine + '.info'),
        this.data
      );

      /**
       * Create module.module
       */
      this.fs.copyTpl(
        this.templatePath(this.props.drupalCore + '/_template.module'),
        this.destinationPath(this.moduleNameMachine + '.module'),
        this.data
      );

      /**
       * Create module.install
       */
      this.fs.copyTpl(
        this.templatePath(this.props.drupalCore + '/_template.install'),
        this.destinationPath(this.moduleNameMachine + '.install'),
        this.data
      );

      /**
       * Create Drush command
       */
      if (this.props.drushCommand) {
        this.fs.copyTpl(
          this.templatePath(this.props.drupalCore + '/drush/_template.drush.inc'),
          this.destinationPath('./drush/' + this.moduleNameMachine + '.drush.inc'),
          this.data
        );
      }
    } else if (this.props.drupalCore === drupal8) {
      /**
       * Create module.info
       */
      this.fs.copyTpl(
        this.templatePath(this.props.drupalCore + '/_template.info.yml'),
        this.destinationPath(this.moduleNameMachine + '.info.yml'),
        this.data
      );

      /**
       * Create module.module
       */
      this.fs.copyTpl(
        this.templatePath(this.props.drupalCore + '/_template.module'),
        this.destinationPath(this.moduleNameMachine + '.module'),
        this.data
      );

      /**
       * Create module.install
       */
      this.fs.copyTpl(
        this.templatePath(this.props.drupalCore + '/_template.install'),
        this.destinationPath(this.moduleNameMachine + '.install'),
        this.data
      );
    } else {
      console.error('Drupal Core not allowed!');
    }
  }
};
