<?php

/**
 * @file
 *   drush integration for <%= moduleNameMachine %>.
 */

define('<%= moduleNameUpper %>_NAME_DOWNLOAD_URI', '<%= libraryRepoDownload %>');
define('<%= moduleNameUpper %>_NAME_DOWNLOAD_PREFIX', '<%= libraryExtractPreffix %>');

/**
 * Implementation of hook_drush_command().
 *
 * In this hook, you specify which commands your
 * drush module makes available, what it does and
 * description.
 *
 * Notice how this structure closely resembles how
 * you define menu hooks.
 *
 * See `drush topic docs-commands` for a list of recognized keys.
 *
 * @return array
 *   An associative array describing your command(s).
 */
function <%= moduleNameMachine %>_drush_command() {
  $items = [];

  // the key in the $items array is the name of the command.
  $items['<%= moduleNameDash %>-download'] = [
    'callback'    => 'drush_<%= moduleNameMachine %>_download',
    'description' => dt('Download and install the <%= libraryName %> library.'),
    'bootstrap'   => DRUSH_BOOTSTRAP_DRUSH, // No bootstrap.
    'arguments'   => [
      'path' => dt('Optional. A path where to install the <%= libraryName %> library. If omitted Drush will use the default location.'),
    ],
    'aliases'     => ['<%= moduleNameDash %>-dl'],
  ];

  return $items;
}

/**
 * Implementation of hook_drush_help().
 *
 * This function is called whenever a drush user calls
 * 'drush help <name-of-your-command>'
 *
 * @param string $section
 *   A string with the help section (prepend with 'drush:')
 *
 * @return string
 *   A string with the help text for your command.
 */
function <%= moduleNameMachine %>_drush_help($section) {
  switch ($section) {
    case 'drush:<%= moduleNameDash %>-download':
      return dt('Download and install the <%= libraryName %> library from <%= libraryRepoDownload %>, default location is sites/all/libraries.');
  }
}

/**
 * Implements drush_MODULE_pre_pm_enable().
 */
function drush_<%= moduleNameMachine %>_pre_pm_enable() {
  $modules = drush_get_context('PM_ENABLE_MODULES');
  if (in_array('<%= moduleNameMachine %>', $modules) && !drush_get_option('skip')) {
    drush_<%= moduleNameMachine %>_download();
  }
}

/**
 * Command to download the <%= libraryName %> library.
 */
function drush_<%= moduleNameMachine %>_download() {
  $args = func_get_args();
  if (!empty($args[0])) {
    $path = $args[0];
  }
  else {
    $path = 'sites/all/libraries';
  }

  // Create the path if it does not exist.
  if (!is_dir($path)) {
    drush_op('mkdir', $path);
    drush_log(dt('Directory @path was created', ['@path' => $path]), 'notice');
  }

  // Download <%= moduleNameMachine %> download only if path is writable.
  if (is_writable($path)) {
    // Set the directory to the download location.
    $olddir = getcwd();
    chdir($path);

    // Download the zip archive
    if ($filepath = drush_download_file(<%= moduleNameUpper %>_NAME_DOWNLOAD_URI)) {
      $filename = basename($filepath);
      $dirname  = <%= moduleNameUpper %>_NAME_DOWNLOAD_PREFIX . basename($filepath, '.zip');

      // Remove any existing <%= libraryName %> library directory.
      if (is_dir($dirname) || is_dir('<%= moduleNameDash %>')) {
        drush_delete_dir($dirname, TRUE);
        drush_delete_dir('<%= moduleNameMachine %>', TRUE);
        drush_log(dt('A existing <%= libraryName %> library was deleted from @path', ['@path' => $path]), 'notice');
      }

      // Decompress the zip archive
      drush_tarball_extract($filename);

      // Change the directory name to "<%= moduleNameMachine %>" if needed.
      if ($dirname != '<%= moduleNameDash %>') {
        drush_move_dir($dirname, '<%= moduleNameDash %>', TRUE);
        $dirname = '<%= moduleNameDash %>';
      }
    }

    if (is_dir($dirname)) {
      drush_log(dt('<%= libraryName %> library has been installed in @path', ['@path' => $path]), 'success');
    }
    else {
      drush_log(dt('Drush was unable to install the <%= libraryName %> library to @path', ['@path' => $path]), 'error');
    }

    // Set working directory back to the previous working directory.
    chdir($olddir);
  }
  else {
    drush_log(dt('Drush was unable to install the <%= libraryName %> library because @path is not writable. If you enable the <%= moduleNameMachine %> module before you install the download library, you may find that <%= moduleNameMachine %> does not work until you reinstall the <%= moduleNameMachine %> module.', ['@path' => $path]), 'warning');
  }
}
