import postcss from 'postcss';
import test from 'ava';
import textRemoveGap from './';

function run( tester, input, output, options = {} )
{
	return postcss( [ textRemoveGap( options ) ] )
		.process( input )
		.then(
			result =>
			{
				tester.deepEqual( result.css, output );
				tester.deepEqual( result.warnings().length, 0 );
			}
		);
}

test(
	'Regular selector',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif;}',
		'p {font: 16px/2 "Arial", sans-serif;}'
	)
);

test(
	'Inside both',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: both;}',
		`p {font: 16px/2 "Arial", sans-serif;}
p::before {display: block;content: "";margin-bottom: -0.63em;}
p::after {display: block;content: "";margin-top: -0.67em;}`
	)
);

test(
	'Inside before',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: before;}',
		`p {font: 16px/2 "Arial", sans-serif;}
p::before {display: block;content: "";margin-bottom: -0.63em;}`
	)
);

test(
	'Inside after',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: after;}',
		`p {font: 16px/2 "Arial", sans-serif;}
p::after {display: block;content: "";margin-top: -0.67em;}`
	)
);

test(
	'Outside both',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: outside both;}',
		`p {font: 16px/2 "Arial", sans-serif; margin-top: -0.63em; margin-bottom: -0.67em;}`
	)
);

test(
	'Outside before',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: outside before;}',
		`p {font: 16px/2 "Arial", sans-serif; margin-top: -0.63em;}`
	)
);

test(
	'Outside after',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: outside after;}',
		`p {font: 16px/2 "Arial", sans-serif; margin-bottom: -0.67em;}`
	)
);

test(
	'Owerwrite font-family',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: both "Times New Roman";}',
		`p {font: 16px/2 "Arial", sans-serif;}
p::before {display: block;content: "";margin-bottom: -0.67em;}
p::after {display: block;content: "";margin-top: -0.66em;}`
	)
);

test(
	'Owerwrite line-height',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: both 1.5;}',
		`p {font: 16px/2 "Arial", sans-serif;}
p::before {display: block;content: "";margin-bottom: -0.38em;}
p::after {display: block;content: "";margin-top: -0.42em;}`
	)
);

test(
	'All settings',
	tester => run(
		tester,
		'p {font: 16px/2 "Arial", sans-serif; text-remove-gap: outside both 1.5 "Times New Roman", serif;}',
		`p {font: 16px/2 "Arial", sans-serif; margin-top: -0.42em; margin-bottom: -0.41em;}`
	)
);

test(
	'Separate font properties',
	tester => run(
		tester,
		'p {font-family: "Arial", sans-serif; line-height: 2; text-remove-gap: both;}',
		`p {font-family: "Arial", sans-serif; line-height: 2;}
p::before {display: block;content: "";margin-bottom: -0.63em;}
p::after {display: block;content: "";margin-top: -0.67em;}`
	)
);

test(
	'Line-height in pixels',
	tester => run(
		tester,
		'p {font-family: "Arial", sans-serif; line-height: 24px; text-remove-gap: both;}',
		`p {font-family: "Arial", sans-serif; line-height: 24px;}
p::before {display: block;content: "";margin-bottom: calc(-0.13em - (24px - 1em) / 2);}
p::after {display: block;content: "";margin-top: calc(-0.17em - (24px - 1em) / 2);}`
	)
);

test(
	'Only line-height',
	tester => run(
		tester,
		'p {line-height: 2; text-remove-gap: both;}',
		`p {line-height: 2;}
p::before {display: block;content: "";margin-bottom: -0.5em;}
p::after {display: block;content: "";margin-top: -0.5em;}`
	)
);

test(
	'No font settings',
	tester => run(
		tester,
		'p {text-remove-gap: both;}',
		`p {}`
	)
);

test(
	'Default font family',
	tester => run(
		tester,
		'p {line-height: 2; text-remove-gap: both;}',
		`p {line-height: 2;}
p::before {display: block;content: "";margin-bottom: -0.63em;}
p::after {display: block;content: "";margin-top: -0.67em;}`,
		{defaultFontFamily: 'Arial'}
	)
);

test(
	'Default line height',
	tester => run(
		tester,
		'p {font-family: "Arial", sans-serif; text-remove-gap: both;}',
		`p {font-family: "Arial", sans-serif;}
p::before {display: block;content: "";margin-bottom: -0.63em;}
p::after {display: block;content: "";margin-top: -0.67em;}`,
		{defaultLineHeight: 2}
	)
);

test(
	'Custom font',
	tester => run(
		tester,
		'p {font-family: "_Some Very Custom Font_", sans-serif; text-remove-gap: both;}',
		`p {font-family: "_Some Very Custom Font_", sans-serif;}
p::before {display: block;content: "";margin-bottom: -0.1em;}
p::after {display: block;content: "";margin-top: -0.2em;}`,
		{fonts: {'_Some Very Custom Font_': [0.1, 0.2]}}
	)
);

test(
	'Unknown font',
	tester => run(
		tester,
		'p {font-family: "_Some Unknown Font_"; text-remove-gap: both;}',
		`p {font-family: "_Some Unknown Font_";}`
	)
);

test(
	'Unknown font with line-height',
	tester => run(
		tester,
		'p {font: 16px/2 "_Some Unknown Font_"; text-remove-gap: both;}',
		`p {font: 16px/2 "_Some Unknown Font_";}
p::before {display: block;content: "";margin-bottom: -0.5em;}
p::after {display: block;content: "";margin-top: -0.5em;}`
	)
);

test(
	'Two selectors',
	tester => run(
		tester,
		'ul > li, ol > li {font: 16px/2 "Arial", sans-serif; text-remove-gap: both;}',
		`ul > li, ol > li {font: 16px/2 "Arial", sans-serif;}
ul > li::before, ol > li::before {display: block;content: "";margin-bottom: -0.63em;}
ul > li::after, ol > li::after {display: block;content: "";margin-top: -0.67em;}`
	)
);

test(
	'Two selectors, outside',
	tester => run(
		tester,
		'ul > li, ol > li {font: 16px/2 "Arial", sans-serif; text-remove-gap: outside both;}',
		`ul > li, ol > li {font: 16px/2 "Arial", sans-serif; margin-top: -0.63em; margin-bottom: -0.67em;}`
	)
);
