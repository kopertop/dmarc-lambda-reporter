const { rules: baseStyleRules } = require('eslint-config-airbnb-base/rules/style');

const indentOptions = {
	SwitchCase: 1
};

module.exports = {
	root: true,
	extends: [
		'airbnb-typescript/base',
	],
	rules: {
		// Use interfaces when possible rather than types for compatibility with typedoc
		'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

		// Not compatible with type-only imports in TypeScript that are not subject
		// to import cycle concerns
		'import/no-cycle': 'off',

		// Import statement ordering and grouping
		'import/order': ['error', {
			// Alphabetize files within each group
			alphabetize: {
				order: 'asc',
				caseInsensitive: true,
			},
			groups: [
				['builtin', 'external', 'internal'],
				['parent'],
				['sibling', 'index'],
			],
			'newlines-between': 'always',
		}],
		// Alphabetize members within each import statement
		'sort-imports': ['error', {
			ignoreDeclarationSort: true,
		}],

		// Default export should generally be avoided
		'import/prefer-default-export': 'off',

		// We <3 tabs
		'no-tabs': 'off',
		'indent': ['error', 'tab', indentOptions],
		'@typescript-eslint/indent': ['error', 'tab', indentOptions],

		// For assignment in while loops
		'no-cond-assign': ['error', 'except-parens'],

		// For method overloading
		'no-dupe-class-members': 'off',

		// Allow empty constructors that initialize class members
		'no-empty-function': 'off',
		'@typescript-eslint/no-empty-function': 'error',
		'no-useless-constructor': 'off',
		'@typescript-eslint/no-useless-constructor': 'error',

		// Warn when hoisting may lead to confusing code, except for functions
		'@typescript-eslint/no-use-before-define': ['error', 'nofunc'],


		// Disable commonly misused or error-prone syntax
		// Airbnb excludes ForOfStatement to avoid generators, but that's too harsh
		'no-restricted-syntax': baseStyleRules['no-restricted-syntax'].filter(
			(option) => typeof option === 'string' || option.selector !== 'ForOfStatement',
		),

		// We have parameters that start with underscores (_geoloc)
		'no-underscore-dangle': 'off',

		// console logging is *expected* for backend functions
		'no-console': 'off',

		// aws-lambda is a devDependency but it's available in Lambda directly
		'import/no-extraneous-dependencies': 'off',

		// Several of my libraries use parameter re-assignment for mutation
		'no-param-reassign': 'off',
		'no-continue': 'off',
		'guard-for-in': 'off',
		'no-restricted-syntax': 'off',

		// What is this?
		'newline-per-chained-call': 'off',
		'no-await-in-loop': 'off',
	},
	settings: {
		'import/resolver': {
			// Allow .d.ts imports, e.g. ts-essentials
			typescript: {},
		},
	},
	parserOptions: {
		project: [
			'./tsconfig.json',
		],
	},
};
