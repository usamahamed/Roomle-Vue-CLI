# Vue Command Runner (VCR) CLI

VCR is a CLI tool to generate and manage Vuex stores and Vue components in your Vue.js projects. It provides commands to create, update, and delete stores, mutations, getters, and components.

## Installation

To install VCR, make sure you have Node.js and npm installed. Then run the following command:

`npm install -g vcr-cli`


## Usage

To use VCR, run the `node vcr.js` command followed by the desired command and options.

## Commands


### Create Component

Create a new Vue component.

`node vcr.js create components <path> <componentName>`

`node vcr.js create c <path> <componentName>`

#### Example

`node vcr.js create components src/components MyComponent`


### Delete Component

Delete an existing Vue component.

#### Usage

`node vcr.js delete-component <path> <componentName>`


#### Example

`node vcr.js delete-component src/components MyComponent`

### Generate Store

Create a new Vuex store with initial state, mutations, actions, and getters.

#### Usage

`node vcr.js generate-store <path> <storeName>`

#### Example

`node vcr.js generate-store src/store planner-ui-state`


### Delete Store

Delete an existing Vuex store.

#### Usage

`node vcr.js delete-store <path> <storeName>`


#### Example

`node vcr.js delete-store src/store planner-ui-state`


### Generate Store State

Add a new state property to an existing Vuex store.

#### Usage

`node vcr.js generate-store-state <storeName> <stateName> <type> <initValue>`


#### Example

`node vcr.js generate-store-state planner-ui-state isDrag boolean false`


### Delete Store State

Delete a state property from an existing Vuex store.

#### Usage

`node vcr.js delete-store-state <storeName> <stateName>`


#### Example

`node vcr.js delete-store-state planner-ui-state isDrag`


### Generate Store Mutation

Add a new mutation to an existing Vuex store.

#### Usage

`node vcr.js generate-store-mutation`

And then you will prompted to enter these values `<storeName> <mutationName> <stateName> <type> <initValue>`


#### Example

`node vcr.js generate-store-mutation planner-ui-state setIsDrag isDrag boolean false`

### Generate Store Getter

Add a new getter to an existing Vuex store.

#### Usage

`node vcr.js generate-store-getter`

And then you will prompted to enter these values `<storeName> <getterName> <stateName>`


#### Example

`node vcr.js generate-store-getter planner-ui-state getIsDrag isDrag`

### Generate Store Action

Add a new action to an existing Vuex store.

#### Usage

`node vcr.js generate-store-action`

And then you will prompted to enter these values `<storeName> <actionName>`


#### Example

`node vcr.js generate-store-getter planner-ui-state SOME_ACTION`
