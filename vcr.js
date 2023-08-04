#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import {fileURLToPath} from 'url'; // To convert URL to file path
import glob from 'glob'; // Add the glob package
import inquirer from 'inquirer';

// Helper function to get the templates folder path
const getTemplatesFolderPath = (searchFolder = 'templates') => {
    const currentFileUrl = import.meta.url;
    const currentFilePath = fileURLToPath(currentFileUrl);
    return path.join(path.dirname(currentFilePath), searchFolder);
};
const getSrcFolderPath = () => {
    const currentFileUrl = import.meta.url;
    const currentFilePath = fileURLToPath(currentFileUrl);
    const srcFolderPath = path.join(path.dirname(currentFilePath), 'src');
    return path.resolve(srcFolderPath); // Convert to absolute path
  };
const findStoreFilePath = (srcFolderPath, storeName) => {
    const storeFiles = glob.sync('**/*.ts', { cwd: srcFolderPath, absolute: true });
    return storeFiles.find((file) => path.basename(file, '.ts') === storeName);
  };
// Helper function to update the store state
  
const convertToAliasFormat = (filePath) => {
    const srcIndex = filePath.indexOf('src');

    if (srcIndex !== -1) {
      const aliasPath = '@' + filePath.substring(srcIndex + 3);
      return aliasPath;
    }
  
    // If 'src' is not found, return the original filePath
    return filePath;
};
const deleteStoreFile = (storePath, moduleName) => {
    const fullPath = path.join(storePath, `${moduleName}.ts`);
  
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(chalk.red(`Store file '${moduleName}.ts' deleted successfully from path '${storePath}'.`));
    } else {
      console.error(chalk.red(`Error: Store file '${moduleName}.ts' not found in path '${storePath}'.`));
    }
  };


// Helper function to update store content with state, mutation, and mutation function
const generateStoreMutation = (storeContent, storeName, mutationName, stateName, type, initValue) => {
    // Generate the uppercase form of mutationName (e.g., SET_IS_DRAG)
    const uppercaseMutationName = mutationName.toUpperCase();
    const moduleNameCamelCase = storeName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  
    // Append the new mutation to the "<moduleNameUppercase>_MUTATIONS" object
    const mutationProperty = `  ${uppercaseMutationName}: "${storeName.toUpperCase().replaceAll('-', '_')}_${uppercaseMutationName}",\n`;
    storeContent = storeContent.replace(/export const .*_MUTATIONS: .* = {\n/, (match) => match + mutationProperty);
  
    // Append the new mutation function to the "mutations" object
    const mutationFunction = `  [${storeName.toUpperCase().replaceAll('-', '_')}_MUTATIONS.${uppercaseMutationName}](
      state: ${moduleNameCamelCase[0].toUpperCase() + moduleNameCamelCase.slice(1)},
      ${stateName}: ${type}
    ) {
      state.${stateName} = ${initValue};
    },\n`;
    storeContent = storeContent.replace(/const mutations: MutationTree<.*> = {\n/, (match) => match + mutationFunction);
  
    // Append the new state property to the store state interface
    const stateProperty = `  ${stateName}: ${type};\n`;
    storeContent = storeContent.replace(/export interface .*State {/, (match) => match + stateProperty);
  
    // Append the initial value to the initialState variable
    const initialStateValue = `  ${stateName}: ${initValue},\n`;
    storeContent = storeContent.replace(/export const initialState: .* = {/, (match) => match + initialStateValue);
  
    return storeContent;
};
  
const generateStoreGetter = (storeContent, storeName, getterName, stateName) => {
    // Generate the uppercase form of mutationName (e.g., SET_IS_DRAG)
    const uppercaseGetterName = getterName.toUpperCase();
  
    // Append the new mutation to the "<moduleNameUppercase>_GETTERS" object
    const getterProperty = `  ${uppercaseGetterName}: "${storeName.toUpperCase().replaceAll('-', '_')}_${uppercaseGetterName}",\n`;
    storeContent = storeContent.replace(/export const .*_GETTERS: .* = {\n/, (match) => match + getterProperty);
  
    // Append the new mutation function to the "mutations" object
    const getterFunction = stateName ? `  [${storeName.toUpperCase().replaceAll('-', '_')}_GETTERS.${uppercaseGetterName}](state) {
      return state.${stateName};
    },\n` : `  [${storeName.toUpperCase().replaceAll('-', '_')}_GETTERS.${uppercaseGetterName}](state) {
        return true;
      },\n`;
    storeContent = storeContent.replace(/const getters: GetterTree<.*> = {\n/, (match) => match + getterFunction);
    
    return storeContent;
  };
  
  const generateStoreAction = (storeContent, storeName, actionName) => {
    // Generate the uppercase form of mutationName (e.g., SET_IS_DRAG)
    const uppercaseActionName = actionName.toUpperCase();
  
    // Append the new mutation to the "<moduleNameUppercase>_GETTERS" object
    const getterProperty = `  ${uppercaseActionName}: "${storeName.toUpperCase().replaceAll('-', '_')}_${uppercaseActionName}",\n`;
    storeContent = storeContent.replace(/export const .*_ACTIONS: .* = {\n/, (match) => match + getterProperty);
  
    // Append the new mutation function to the "mutations" object
    const actionFunction = `  [${storeName.toUpperCase().replaceAll('-', '_')}_ACTIONS.${uppercaseActionName}]({commit, dispatch}): void {
      return true;
    },\n`
    storeContent = storeContent.replace(/const mutations: MutationTree<.*> = {\n/, (match) => match + actionFunction);
    
    return storeContent;
  };
  

program.version('1.0.0').description('CLI tool for Vue.js app component creation and deletion');

// Define the valid creation types
const validCreationTypes = ['components', 'c'];

// Define the 'create' command
program
  .command('create <type> [path] [componentName]')
  .description('Create a new component')
  .action((type, providedPath, componentName) => {
    // Check if the provided type is valid
    if (!validCreationTypes.includes(type)) {
      console.error(chalk.red(`Error: Invalid creation type '${type}'. Use either 'components' or 'c'.`));
      return;
    }

    // Set default values if not provided
    const defaultComponentName = componentName || 'MyComponent';
    const defaultComponentFileName = `${defaultComponentName}.vue`;
    const defaultTestFileName = `${defaultComponentName}.spec.ts`;

    // Determine the default paths
    const defaultComponentsPath = path.join('.', '/src/components');
    const defaultTestsPath = path.join('.', 'tests');

    // Determine the provided component path
    const componentsPath = providedPath
      ? providedPath.includes('src')
        ? path.join('.', providedPath)
        : path.join(defaultComponentsPath, providedPath)
      : defaultComponentsPath;

    const testsPath = providedPath
      ? providedPath.includes('src')
        ? path.join('.', 'tests', providedPath.slice(providedPath.indexOf('src') + 'src'.length + 1))
        : path.join(defaultTestsPath, providedPath)
      : defaultTestsPath;

    // Create the components folder if it doesn't exist
    if (!fs.existsSync(componentsPath)) {
      fs.mkdirSync(componentsPath, { recursive: true });
    }

    // Create the tests folder if it doesn't exist
    if (!fs.existsSync(testsPath)) {
      fs.mkdirSync(testsPath, { recursive: true });
    }

    // Create the component file path without creating a folder for the component name
    const componentPath = path.join(componentsPath, defaultComponentFileName);

    // Check if the component file already exists
    if (fs.existsSync(componentPath)) {
      console.error(chalk.red(`Error: Component '${defaultComponentFileName}' already exists.`));
      return;
    }

    // Read the component template from the templates folder
    const templatesFolderPath = getTemplatesFolderPath();
    const componentTemplatePath = path.join(templatesFolderPath, 'component.template.vue');
    const componentContent = fs.readFileSync(componentTemplatePath, 'utf-8');

    // Replace the placeholder with the component name in the component template
    const updatedComponentContent = componentContent.replace(/COMPONENT_NAME/g, defaultComponentName);

    // Write the component template to the file
    fs.writeFile(componentPath, updatedComponentContent, (err) => {
      if (err) {
        console.error(chalk.red(`Error creating component file: ${err}`));
        return;
      }
      console.log(chalk.green(`Component '${defaultComponentFileName}' created successfully.`));
    });

    // Create the test file path without creating a folder for the component name
    const testPath = path.join(testsPath, defaultTestFileName);

    // Check if the test file already exists
    if (fs.existsSync(testPath)) {
      console.error(chalk.red(`Error: Test '${defaultTestFileName}' already exists.`));
      return;
    }

    // Read the test template from the templates folder
    const testTemplatePath = path.join(templatesFolderPath, 'test.template.ts');
    const testContent = fs.readFileSync(testTemplatePath, 'utf-8');

    // Replace the placeholder with the component name in the test template
    const updatedTestContent = testContent.replace(/{{ COMPONENT_NAME }}/g, defaultComponentName);
    const relativeComponentPath = path.relative(testsPath, componentPath).replace(/\\/g, '/');
    const updatedRelativeTestContent = updatedTestContent.replace(/{{ RELATIVE_COMPONENT_PATH }}/g, convertToAliasFormat(relativeComponentPath));

    // Write the test template to the file
    fs.writeFile(testPath, updatedRelativeTestContent, (err) => {
      if (err) {
        console.error(chalk.red(`Error creating test file: ${err}`));
        return;
      }
      console.log(chalk.green(`Test '${defaultTestFileName}' created successfully.`));
    });
  });

// Define the 'delete' command
program
  .command('delete <type> <path> <componentName>')
  .description('Delete a component')
  .action((type, providedPath, componentName) => {
    // Check if the provided type is valid
    if (!validCreationTypes.includes(type)) {
      console.error(chalk.red(`Error: Invalid creation type '${type}'. Use either 'components' or 'c'.`));
      return;
    }

    // Determine the default paths
    const defaultComponentsPath = path.join('.', '/src/components');
    const defaultTestsPath = path.join('.', 'tests');

    // Determine the provided component path
    const componentsPath = providedPath.includes('src')
      ? path.join('.', providedPath)
      : path.join(defaultComponentsPath, providedPath);

    const testsPath = providedPath.includes('src')
      ? path.join('.', 'tests', providedPath.slice(providedPath.indexOf('src') + 'src'.length + 1))
      : path.join(defaultTestsPath, providedPath);

    // Create the component file path without creating a folder for the component name
    const componentPath = path.join(componentsPath, `${componentName}.vue`);
    const testPath = path.join(testsPath, `${componentName}.spec.ts`);

    // Check if the component file exists and delete it
    if (fs.existsSync(componentPath)) {
      fs.unlinkSync(componentPath);
      console.log(chalk.red(`Component '${componentName}.vue' deleted successfully.`));
    } else {
      console.error(chalk.red(`Error: Component '${componentName}.vue' not found.`));
    }

    // Check if the test file exists and delete it
    if (fs.existsSync(testPath)) {
      fs.unlinkSync(testPath);
      console.log(chalk.red(`Test '${componentName}.spec.ts' deleted successfully.`));
    } else {
      console.error(chalk.red(`Error: Test '${componentName}.spec.ts' not found.`));
    }
  });






  program
  .command('generate-store <path> <module>')
  .alias('g-store')
  .description('Generate a new Vuex store')
  .action((storePath, moduleName) => {
    const moduleNameCamelCase = moduleName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    const moduleNameUppercase = moduleName.replaceAll('-', '_').toUpperCase();

    const templatesFolderPath = getTemplatesFolderPath();

    const storeTemplatePath = path.join(templatesFolderPath, 'store.template.ts');

    // Read the store template content from the 'templates' folder
    const storeTemplateContent = fs.readFileSync(storeTemplatePath, 'utf-8');

    // Replace placeholders with the actual module name (camel case and uppercase)
    const storeContent = storeTemplateContent
      .replace(/<moduleNameUppercase>/g, moduleNameUppercase + '_')
      .replace(/<moduleName>/g, moduleNameCamelCase[0].toUpperCase() + moduleNameCamelCase.slice(1));

    // Create the store file under the specified path
    const fullPath = path.join(storePath, `${moduleName}.ts`);

    // Check if the file already exists
    if (fs.existsSync(fullPath)) {
      console.error(chalk.red(`Error: Store file '${moduleName}.ts' already exists in path '${storePath}'.`));
      return;
    }

    fs.mkdirpSync(storePath); // Create nested folders if needed

    fs.writeFile(fullPath, storeContent, 'utf-8', (err) => {
      if (err) {
        console.error(chalk.red(`Error creating store file: ${err.message}`));
        return;
      }

      console.log(chalk.green(`Store file '${moduleName}.ts' created successfully under path '${storePath}'.`));
    });
  });


  program
  .command('delete-store <path> <module>')
  .alias('d-store')
  .description('Delete an existing Vuex store')
  .action((storePath, moduleName) => {
    deleteStoreFile(storePath, moduleName);
  });


// Refactored 'generate-store-state' command
program
  .command('generate-store-state <storeName> <stateName> <type> <initValue>')
  .alias('g-store-s')
  .description('Generate a new state property for an existing Vuex store')
  .action((storeName, stateName, type, initValue) => {
    const srcFolderPath = getSrcFolderPath();
    const storeFilePath = findStoreFilePath(srcFolderPath, storeName);

    if (!storeFilePath) {
      console.error(chalk.red(`Error: Store file '${storeName}.ts' not found in path '${srcFolderPath}'.`));
      return;
    }

    let storeContent = fs.readFileSync(storeFilePath, 'utf-8');

    // Generate the capitalized form of storeName (e.g., planner-ui-state)
    const capitalizedStoreName = storeName.replace(/(^|-)([a-z])/g, (match, _, letter) => letter.toUpperCase());

    // Append the new state property to the "plannerUiStateState" interface
    const newInterfaceProperty = `  ${stateName}: ${type};\n`;
    storeContent = storeContent.replace(/export interface plannerUiStateState {\n/, (match) => match + newInterfaceProperty);

    // Append the new state property with the initial value to the "initialState" variable
    const newInitialStateProperty = `  ${stateName}: ${initValue},\n`;
    storeContent = storeContent.replace(/export const initialState: plannerUiStateState = {\n/, (match) => match + newInitialStateProperty);

    // Save the updated store file
    fs.writeFileSync(storeFilePath, storeContent, 'utf-8');

    console.log(chalk.green(`Store state '${stateName}' with type '${type}' and initial value '${initValue}' added successfully to store '${storeName}.ts'.`));
  });


  // New 'delete-store-state' command
program
.command('delete-store-state <storeName> <stateName>')
.alias('d-store-s')
.description('Delete a state property from an existing Vuex store')
.action((storeName, stateName) => {
  const srcFolderPath = getSrcFolderPath();
  const storeFilePath = findStoreFilePath(srcFolderPath, storeName);

  if (!storeFilePath) {
    console.error(chalk.red(`Error: Store file '${storeName}.ts' not found in path '${srcFolderPath}'.`));
    return;
  }

  let storeContent = fs.readFileSync(storeFilePath, 'utf-8');

  // Generate the capitalized form of storeName (e.g., planner-ui-state)
  const capitalizedStoreName = storeName.replace(/(^|-)([a-z])/g, (match, _, letter) => letter.toUpperCase());

  // Remove the state property from the "plannerUiStateState" interface
  storeContent = storeContent.replace(new RegExp(`  ${stateName}: .*;\n`, 'g'), '');

  // Remove the state property from the "initialState" variable
  storeContent = storeContent.replace(new RegExp(`  ${stateName}: .*,\n`, 'g'), '');

  // Save the updated store file
  fs.writeFileSync(storeFilePath, storeContent, 'utf-8');

  console.log(chalk.red(`Store state '${stateName}' deleted successfully from store '${storeName}.ts'.`));
});


program
  .command('generate-store-mutation')
  .alias('g-store-m')
  .description('Generate a new mutation for an existing Vuex store')
  .action(async () => {
    const questions = [
      {
        type: 'input',
        name: 'storeName',
        message: 'Enter store name:',
      },
      {
        type: 'input',
        name: 'mutationName',
        message: 'Enter mutation name:',
      },
      {
        type: 'input',
        name: 'stateName',
        message: 'Enter state name:',
      },
      {
        type: 'input',
        name: 'type',
        message: 'Enter state type:',
      },
      {
        type: 'input',
        name: 'initValue',
        message: 'Enter initial value for the state:',
      },
    ];

    try {
      const answers = await inquirer.prompt(questions);

      const srcFolderPath = getSrcFolderPath();
      const storeFilePath = findStoreFilePath(srcFolderPath, answers.storeName);

      if (!storeFilePath) {
        console.error(chalk.red(`Error: Store file '${answers.storeName}.ts' not found in path '${srcFolderPath}'.`));
        return;
      }

      let storeContent = fs.readFileSync(storeFilePath, 'utf-8');

      // Check if the mutation already exists in the "<moduleNameUppercase>_MUTATIONS" object
      const uppercaseMutationName = answers.mutationName.toUpperCase();
      if (new RegExp(`\\s+${uppercaseMutationName}:`).test(storeContent)) {
        console.error(chalk.red(`Error: Mutation '${answers.mutationName}' already exists in store '${answers.storeName}.ts'.`));
        return;
      }

      // Update the store content with state, mutation, and mutation function
      storeContent = generateStoreMutation(
        storeContent,
        answers.storeName,
        answers.mutationName,
        answers.stateName,
        answers.type,
        answers.initValue
      );

      // Save the updated store file
      fs.writeFileSync(storeFilePath, storeContent, 'utf-8');

      console.log(chalk.green(`Store mutation '${answers.mutationName}' added successfully to store '${answers.storeName}.ts'.`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

  program
  .command('generate-store-getter')
  .alias('g-store-g')
  .description('Generate a new getter for an existing Vuex store')
  .action(async () => {
    const questions = [
      {
        type: 'input',
        name: 'storeName',
        message: 'Enter store name:',
      },
      {
        type: 'input',
        name: 'getterName',
        message: 'Enter mutation name:',
      },
      {
        type: 'input',
        name: 'stateName',
        message: 'Enter state name:',
      },
    ];

    try {
      const answers = await inquirer.prompt(questions);

      const srcFolderPath = getSrcFolderPath();
      const storeFilePath = findStoreFilePath(srcFolderPath, answers.storeName);

      if (!storeFilePath) {
        console.error(chalk.red(`Error: Store file '${answers.storeName}.ts' not found in path '${srcFolderPath}'.`));
        return;
      }

      let storeContent = fs.readFileSync(storeFilePath, 'utf-8');

      // Check if the mutation already exists in the "<moduleNameUppercase>_MUTATIONS" object
      const uppercaseGetterName = answers.getterName.toUpperCase();
      if (new RegExp(`\\s+${uppercaseGetterName}:`).test(storeContent)) {
        console.error(chalk.red(`Error: Getter '${answers.getterName}' already exists in store '${answers.storeName}.ts'.`));
        return;
      }

      // Update the store content with state, mutation, and mutation function
      storeContent = generateStoreGetter(
        storeContent,
        answers.storeName,
        answers.getterName,
        answers.stateName,
      );

      // Save the updated store file
      fs.writeFileSync(storeFilePath, storeContent, 'utf-8');

      console.log(chalk.green(`Store getter '${answers.getterName}' added successfully to store '${answers.storeName}.ts'.`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

  program
  .command('generate-store-action')
  .alias('g-store-a')
  .description('Generate a new action for an existing Vuex store')
  .action(async () => {
    const questions = [
      {
        type: 'input',
        name: 'storeName',
        message: 'Enter store name:',
      },
      {
        type: 'input',
        name: 'actionName',
        message: 'Enter action name:',
      },
    ];

    try {
      const answers = await inquirer.prompt(questions);

      const srcFolderPath = getSrcFolderPath();
      const storeFilePath = findStoreFilePath(srcFolderPath, answers.storeName);

      if (!storeFilePath) {
        console.error(chalk.red(`Error: Store file '${answers.storeName}.ts' not found in path '${srcFolderPath}'.`));
        return;
      }

      let storeContent = fs.readFileSync(storeFilePath, 'utf-8');

      const uppercaseActionName = answers.actionName.toUpperCase();
      if (new RegExp(`\\s+${uppercaseActionName}:`).test(storeContent)) {
        console.error(chalk.red(`Error: Action '${answers.actionName}' already exists in store '${answers.storeName}.ts'.`));
        return;
      }

      // Update the store content with state, mutation, and mutation function
      storeContent = generateStoreAction(
        storeContent,
        answers.storeName,
        answers.actionName,
      );

      // Save the updated store file
      fs.writeFileSync(storeFilePath, storeContent, 'utf-8');

      console.log(chalk.green(`Store action '${answers.actionName}' added successfully to store '${answers.storeName}.ts'.`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });



// Parse the arguments and execute the command
program.parse(process.argv);

// If no command is provided, display help
if (!program.args.length) program.help();
